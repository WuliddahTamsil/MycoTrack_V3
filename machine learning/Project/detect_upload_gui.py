"""
detect_upload_gui.py - Upload & detect gambar dengan GUI
"""

import tkinter as tk
from tkinter import filedialog, ttk
from PIL import Image, ImageTk
import torch
import cv2
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta

# Import config
from config import *

# Tambahkan normalisasi label (samakan dengan detect_jamur_pc.py)
LABEL_MAP = {
    'primordia': 'Primordia',
    'Primordia': 'Primordia',
    'Fase Muda': 'Muda',
    'Muda': 'Muda',
    'Matang': 'Matang',
    'matang': 'Matang'
}

class MushroomDetectorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🍄 Mushroom Detection - Upload Image")
        self.root.geometry("1200x800")
        self.root.configure(bg='#1a1a1a')
        
        # Load model
        print("[INFO] Loading model...")
        self.model = self.load_model()
        
        # Current image
        self.current_image = None
        self.current_image_path = None
        
        # Setup UI
        self.setup_ui()
    
    def load_model(self):
        """Load YOLOv5 model"""
        try:
            model = torch.hub.load('ultralytics/yolov5', 'custom', 
                                  path=MODEL_PATH, force_reload=False)
            model.conf = CONFIDENCE_THRESHOLD
            print("[INFO] Model loaded successfully!")
            return model
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return None
    
    def setup_ui(self):
        """Setup UI components"""
        # Title
        title_frame = tk.Frame(self.root, bg='#2d2d2d', height=80)
        title_frame.pack(fill='x', padx=10, pady=10)
        
        title_label = tk.Label(title_frame, text="🍄 Mushroom Detection System",
                              font=('Arial', 24, 'bold'), bg='#2d2d2d', fg='#4CAF50')
        title_label.pack(pady=20)
        
        # Main content
        content_frame = tk.Frame(self.root, bg='#1a1a1a')
        content_frame.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Left panel - Image display
        left_frame = tk.Frame(content_frame, bg='#2d2d2d', width=800)
        left_frame.pack(side='left', fill='both', expand=True, padx=(0, 10))
        
        # Image canvas
        self.canvas = tk.Canvas(left_frame, bg='#000000', highlightthickness=0)
        self.canvas.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Placeholder text
        self.placeholder_id = self.canvas.create_text(
            400, 300, text="No image loaded\nClick 'Upload Image' to start",
            font=('Arial', 16), fill='#888888', justify='center'
        )
        
        # Right panel - Controls & Results
        right_frame = tk.Frame(content_frame, bg='#2d2d2d', width=300)
        right_frame.pack(side='right', fill='both', padx=(10, 0))
        
        # Upload button
        upload_btn = tk.Button(right_frame, text="📁 Upload Image",
                              font=('Arial', 14, 'bold'), bg='#4CAF50', fg='white',
                              command=self.upload_image, cursor='hand2',
                              padx=20, pady=10)
        upload_btn.pack(pady=20, padx=20, fill='x')
        
        # Detect button
        self.detect_btn = tk.Button(right_frame, text="🔍 Detect Mushrooms",
                                    font=('Arial', 14, 'bold'), bg='#2196F3', fg='white',
                                    command=self.detect_image, cursor='hand2',
                                    padx=20, pady=10, state='disabled')
        self.detect_btn.pack(pady=(0, 20), padx=20, fill='x')
        
        # Results frame
        results_label = tk.Label(right_frame, text="Detection Results",
                                font=('Arial', 14, 'bold'), bg='#2d2d2d', fg='white')
        results_label.pack(pady=(10, 10))
        
        # Results text
        self.results_frame = tk.Frame(right_frame, bg='#1a1a1a')
        self.results_frame.pack(fill='both', expand=True, padx=20, pady=(0, 20))
        
        self.results_text = tk.Text(self.results_frame, bg='#1a1a1a', fg='white',
                                   font=('Courier', 10), wrap='word', state='disabled',
                                   borderwidth=0, highlightthickness=0)
        self.results_text.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Save button
        self.save_btn = tk.Button(right_frame, text="💾 Save Result",
                                 font=('Arial', 12), bg='#FF9800', fg='white',
                                 command=self.save_result, cursor='hand2',
                                 padx=20, pady=8, state='disabled')
        self.save_btn.pack(pady=(0, 20), padx=20, fill='x')
        
        # Status bar
        self.status_var = tk.StringVar()
        self.status_var.set("Ready")
        status_bar = tk.Label(self.root, textvariable=self.status_var,
                             bg='#2d2d2d', fg='#4CAF50', font=('Arial', 10),
                             anchor='w', padx=10)
        status_bar.pack(side='bottom', fill='x')
    
    def upload_image(self):
        """Upload image from file"""
        file_path = filedialog.askopenfilename(
            title="Select Image",
            filetypes=[
                ("Image files", "*.jpg *.jpeg *.png *.bmp"),
                ("All files", "*.*")
            ]
        )
        
        if not file_path:
            return
        
        try:
            # Read image
            self.current_image = cv2.imread(file_path)
            self.current_image_path = file_path
            
            if self.current_image is None:
                self.status_var.set("❌ Error: Cannot read image")
                return
            
            # Display image
            self.display_image(self.current_image)
            
            # Enable detect button
            self.detect_btn.config(state='normal')
            self.save_btn.config(state='disabled')
            
            # Clear results
            self.results_text.config(state='normal')
            self.results_text.delete(1.0, tk.END)
            self.results_text.config(state='disabled')
            
            filename = Path(file_path).name
            self.status_var.set(f"✅ Loaded: {filename}")
            
        except Exception as e:
            self.status_var.set(f"❌ Error: {str(e)}")
    
    def display_image(self, img, is_result=False):
        """Display image on canvas"""
        # Remove placeholder
        if hasattr(self, 'placeholder_id'):
            self.canvas.delete(self.placeholder_id)
        
        # Convert BGR to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize to fit canvas
        canvas_width = self.canvas.winfo_width()
        canvas_height = self.canvas.winfo_height()
        
        if canvas_width <= 1 or canvas_height <= 1:
            canvas_width, canvas_height = 780, 600
        
        h, w = img_rgb.shape[:2]
        scale = min(canvas_width / w, canvas_height / h) * 0.95
        new_w, new_h = int(w * scale), int(h * scale)
        
        img_resized = cv2.resize(img_rgb, (new_w, new_h))
        
        # Convert to PhotoImage
        img_pil = Image.fromarray(img_resized)
        img_tk = ImageTk.PhotoImage(img_pil)
        
        # Display
        self.canvas.delete("all")
        x = (canvas_width - new_w) // 2
        y = (canvas_height - new_h) // 2
        self.canvas.create_image(x, y, anchor='nw', image=img_tk)
        self.canvas.image = img_tk  # Keep reference
    
    def detect_image(self):
        """Run detection on current image"""
        if self.current_image is None or self.model is None:
            return
        try:
            self.status_var.set("🔍 Detecting...")
            self.root.update()
            results = self.model(self.current_image)
            df = results.pandas().xyxy[0]
            img_with_boxes = self.current_image.copy()
            detections = []
            for idx, row in df.iterrows():
                x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
                conf = row['confidence']
                raw_name = row['name']
                cls_name = LABEL_MAP.get(raw_name, raw_name)  # normalisasi
                color = CLASS_COLORS.get(cls_name, (255, 255, 255))
                cv2.rectangle(img_with_boxes, (x1, y1), (x2, y2), color, 2)
                label = f"{cls_name} {conf:.2f}"
                cv2.putText(img_with_boxes, label, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                days = HARVEST_ESTIMATION.get(cls_name, 0)
                harvest_date = datetime.now() + timedelta(days=days)
                harvest_text = f"Panen: {harvest_date.strftime('%d/%m/%Y')} (+{days}d)" if days > 0 else "Siap Panen!"
                cv2.putText(img_with_boxes, harvest_text, (x1, y2 + 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                detections.append({
                    'class': cls_name,
                    'confidence': conf,
                    'harvest_date': harvest_date,
                    'days': days
                })
            self.display_image(img_with_boxes, is_result=True)
            self.update_results(detections)
            self.save_btn.config(state='normal')
            self.status_var.set(f"✅ Detected {len(detections)} mushroom(s)")
        except Exception as e:
            self.status_var.set(f"❌ Detection error: {str(e)}")
    
    def update_results(self, detections):
        """Update results text"""
        self.results_text.config(state='normal')
        self.results_text.delete(1.0, tk.END)
        
        if len(detections) == 0:
            self.results_text.insert(tk.END, "❌ No mushrooms detected\n\n")
            self.results_text.insert(tk.END, "Tips:\n")
            self.results_text.insert(tk.END, "- Ensure good lighting\n")
            self.results_text.insert(tk.END, "- Try different angle\n")
            self.results_text.insert(tk.END, "- Lower confidence threshold\n")
        else:
            self.results_text.insert(tk.END, f"✅ Found {len(detections)} mushroom(s)\n\n")
            
            # Group by class
            primordia = [d for d in detections if d['class'] == 'Primordia']
            muda = [d for d in detections if d['class'] == 'Muda']
            matang = [d for d in detections if d['class'] == 'Matang']
            
            self.results_text.insert(tk.END, "=" * 30 + "\n")
            self.results_text.insert(tk.END, "SUMMARY\n")
            self.results_text.insert(tk.END, "=" * 30 + "\n\n")
            
            self.results_text.insert(tk.END, f"🟡 Primordia: {len(primordia)}\n")
            self.results_text.insert(tk.END, f"🟠 Muda    : {len(muda)}\n")
            self.results_text.insert(tk.END, f"🟢 Matang  : {len(matang)}\n\n")
            
            self.results_text.insert(tk.END, "=" * 30 + "\n")
            self.results_text.insert(tk.END, "DETAILS\n")
            self.results_text.insert(tk.END, "=" * 30 + "\n\n")
            
            for idx, det in enumerate(detections, 1):
                self.results_text.insert(tk.END, f"{idx}. {det['class']}\n")
                self.results_text.insert(tk.END, f"   Confidence: {det['confidence']*100:.1f}%\n")
                
                if det['days'] > 0:
                    self.results_text.insert(tk.END, f"   Harvest: {det['harvest_date'].strftime('%d/%m/%Y')}\n")
                    self.results_text.insert(tk.END, f"   Days left: +{det['days']} days\n\n")
                else:
                    self.results_text.insert(tk.END, f"   Status: READY TO HARVEST!\n\n")
        
        self.results_text.config(state='disabled')
    
    def save_result(self):
        """Save result image"""
        if self.current_image is None:
            return
        
        try:
            # Create output directory
            output_dir = Path("output/uploads")
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            original_name = Path(self.current_image_path).stem
            output_path = output_dir / f"{original_name}_result_{timestamp}.jpg"
            
            # Get current canvas image (with detections)
            # We'll re-run detection to get clean result
            results = self.model(self.current_image)
            
            # Render and save
            results.render()
            cv2.imwrite(str(output_path), results.ims[0])
            
            self.status_var.set(f"✅ Saved: {output_path.name}")
            
        except Exception as e:
            self.status_var.set(f"❌ Save error: {str(e)}")

def main():
    root = tk.Tk()
    app = MushroomDetectorGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()