"""
Script untuk menganalisis dan memvisualisasikan hasil training model YOLO
Menampilkan grafik metrik training dan persentase peningkatan performa
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path
import seaborn as sns

# Set style untuk grafik yang lebih menarik
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (15, 10)

def load_training_results(results_path):
    """Memuat data hasil training dari CSV"""
    df = pd.read_csv(results_path)
    # Membersihkan nama kolom dari spasi
    df.columns = df.columns.str.strip()
    # Menghapus baris duplikat (karena ada reset di CSV)
    df = df[df['epoch'].notna()]
    # Mengambil data dari run terakhir
    last_epoch = df['epoch'].max()
    df = df[df['epoch'] <= last_epoch].reset_index(drop=True)
    return df

def calculate_improvements(df):
    """Menghitung persentase peningkatan dari epoch awal ke akhir"""
    first_epoch = df.iloc[0]
    last_epoch = df.iloc[-1]
    
    improvements = {}
    metrics = [
        'metrics/precision', 
        'metrics/recall', 
        'metrics/mAP_0.5', 
        'metrics/mAP_0.5:0.95'
    ]
    
    for metric in metrics:
        initial = first_epoch[metric]
        final = last_epoch[metric]
        if initial > 0:
            improvement = ((final - initial) / initial) * 100
        else:
            improvement = float('inf') if final > 0 else 0
        improvements[metric] = {
            'initial': initial,
            'final': final,
            'improvement_pct': improvement
        }
    
    # Loss metrics (penurunan adalah peningkatan)
    loss_metrics = ['train/box_loss', 'train/obj_loss', 'train/cls_loss']
    for metric in loss_metrics:
        initial = first_epoch[metric]
        final = last_epoch[metric]
        reduction = ((initial - final) / initial) * 100
        improvements[metric] = {
            'initial': initial,
            'final': final,
            'reduction_pct': reduction
        }
    
    return improvements

def print_summary(df, improvements):
    """Mencetak ringkasan hasil training"""
    print("\n" + "="*70)
    print(" RINGKASAN HASIL TRAINING MODEL YOLO ".center(70, "="))
    print("="*70 + "\n")
    
    print(f"Total Epochs: {int(df['epoch'].max()) + 1}")
    print(f"Best Epoch: {df['metrics/mAP_0.5'].idxmax()}")
    print(f"\n{'METRIK PERFORMA':-^70}")
    
    # Performance Metrics
    perf_metrics = [
        ('Precision', 'metrics/precision'),
        ('Recall', 'metrics/recall'),
        ('mAP@0.5', 'metrics/mAP_0.5'),
        ('mAP@0.5:0.95', 'metrics/mAP_0.5:0.95')
    ]
    
    for name, key in perf_metrics:
        data = improvements[key]
        print(f"\n{name}:")
        print(f"  Awal      : {data['initial']:.4f}")
        print(f"  Akhir     : {data['final']:.4f}")
        if data['improvement_pct'] != float('inf'):
            print(f"  Peningkatan: {data['improvement_pct']:+.2f}%")
        else:
            print(f"  Peningkatan: Sangat Signifikan (dari ~0)")
        print(f"  Terbaik   : {df[key].max():.4f} (Epoch {df[key].idxmax()})")
    
    print(f"\n{'LOSS METRICS':-^70}")
    
    # Loss Metrics
    loss_metrics = [
        ('Box Loss (train)', 'train/box_loss'),
        ('Object Loss (train)', 'train/obj_loss'),
        ('Class Loss (train)', 'train/cls_loss')
    ]
    
    for name, key in loss_metrics:
        data = improvements[key]
        print(f"\n{name}:")
        print(f"  Awal     : {data['initial']:.4f}")
        print(f"  Akhir    : {data['final']:.4f}")
        print(f"  Penurunan: {data['reduction_pct']:.2f}%")
        print(f"  Terendah : {df[key].min():.4f} (Epoch {df[key].idxmin()})")
    
    print("\n" + "="*70 + "\n")

def plot_training_metrics(df, output_dir):
    """Membuat grafik visualisasi training metrics"""
    
    # 1. Performance Metrics
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('Metrik Performa Model YOLO', fontsize=16, fontweight='bold')
    
    metrics = [
        ('metrics/precision', 'Precision', axes[0, 0]),
        ('metrics/recall', 'Recall', axes[0, 1]),
        ('metrics/mAP_0.5', 'mAP @ IoU=0.5', axes[1, 0]),
        ('metrics/mAP_0.5:0.95', 'mAP @ IoU=0.5:0.95', axes[1, 1])
    ]
    
    for metric, title, ax in metrics:
        ax.plot(df['epoch'], df[metric], linewidth=2, marker='o', 
                markersize=3, label=title, color='#2E86AB')
        ax.set_xlabel('Epoch', fontsize=11)
        ax.set_ylabel(title, fontsize=11)
        ax.set_title(f'{title} per Epoch', fontsize=12, fontweight='bold')
        ax.grid(True, alpha=0.3)
        
        # Highlight best value
        best_idx = df[metric].idxmax()
        best_val = df[metric].max()
        ax.plot(df.loc[best_idx, 'epoch'], best_val, 'r*', 
                markersize=15, label=f'Best: {best_val:.4f}')
        ax.legend(fontsize=10)
    
    plt.tight_layout()
    plt.savefig(output_dir / 'performance_metrics.png', dpi=300, bbox_inches='tight')
    print(f"✓ Grafik performa disimpan: {output_dir / 'performance_metrics.png'}")
    
    # 2. Loss Metrics
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('Loss Metrics Training dan Validasi', fontsize=16, fontweight='bold')
    
    loss_pairs = [
        (('train/box_loss', 'val/box_loss'), 'Box Loss', axes[0, 0]),
        (('train/obj_loss', 'val/obj_loss'), 'Object Loss', axes[0, 1]),
        (('train/cls_loss', 'val/cls_loss'), 'Class Loss', axes[1, 0])
    ]
    
    colors = ['#A23B72', '#F18F01']
    for (train_metric, val_metric), title, ax in loss_pairs:
        ax.plot(df['epoch'], df[train_metric], linewidth=2, marker='o', 
                markersize=3, label='Training', color=colors[0])
        ax.plot(df['epoch'], df[val_metric], linewidth=2, marker='s', 
                markersize=3, label='Validation', color=colors[1])
        ax.set_xlabel('Epoch', fontsize=11)
        ax.set_ylabel('Loss', fontsize=11)
        ax.set_title(title, fontsize=12, fontweight='bold')
        ax.legend(fontsize=10)
        ax.grid(True, alpha=0.3)
    
    # Learning Rate
    ax = axes[1, 1]
    ax.plot(df['epoch'], df['x/lr0'], linewidth=2, label='lr0', color='#059142')
    ax.set_xlabel('Epoch', fontsize=11)
    ax.set_ylabel('Learning Rate', fontsize=11)
    ax.set_title('Learning Rate Schedule', fontsize=12, fontweight='bold')
    ax.legend(fontsize=10)
    ax.grid(True, alpha=0.3)
    ax.set_yscale('log')
    
    plt.tight_layout()
    plt.savefig(output_dir / 'loss_metrics.png', dpi=300, bbox_inches='tight')
    print(f"✓ Grafik loss disimpan: {output_dir / 'loss_metrics.png'}")
    
    # 3. Combined Performance Overview
    fig, ax = plt.subplots(figsize=(14, 8))
    
    ax.plot(df['epoch'], df['metrics/precision'], linewidth=2.5, 
            marker='o', markersize=4, label='Precision', color='#2E86AB')
    ax.plot(df['epoch'], df['metrics/recall'], linewidth=2.5, 
            marker='s', markersize=4, label='Recall', color='#A23B72')
    ax.plot(df['epoch'], df['metrics/mAP_0.5'], linewidth=2.5, 
            marker='^', markersize=4, label='mAP@0.5', color='#F18F01')
    ax.plot(df['epoch'], df['metrics/mAP_0.5:0.95'], linewidth=2.5, 
            marker='d', markersize=4, label='mAP@0.5:0.95', color='#059142')
    
    ax.set_xlabel('Epoch', fontsize=13)
    ax.set_ylabel('Score', fontsize=13)
    ax.set_title('Perbandingan Semua Metrik Performa', fontsize=14, fontweight='bold')
    ax.legend(fontsize=11, loc='best')
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_dir / 'combined_metrics.png', dpi=300, bbox_inches='tight')
    print(f"✓ Grafik gabungan disimpan: {output_dir / 'combined_metrics.png'}")
    
    # 4. Bar Chart Perbandingan Awal vs Akhir
    fig, ax = plt.subplots(figsize=(12, 7))
    
    metrics_names = ['Precision', 'Recall', 'mAP@0.5', 'mAP@0.5:0.95']
    metrics_keys = ['metrics/precision', 'metrics/recall', 
                    'metrics/mAP_0.5', 'metrics/mAP_0.5:0.95']
    
    initial_values = [df[key].iloc[0] for key in metrics_keys]
    final_values = [df[key].iloc[-1] for key in metrics_keys]
    
    x = np.arange(len(metrics_names))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, initial_values, width, label='Epoch 0', 
                   color='#E63946', alpha=0.8)
    bars2 = ax.bar(x + width/2, final_values, width, label=f'Epoch {int(df["epoch"].max())}', 
                   color='#06D6A0', alpha=0.8)
    
    ax.set_xlabel('Metrik', fontsize=12)
    ax.set_ylabel('Nilai', fontsize=12)
    ax.set_title('Perbandingan Performa: Awal vs Akhir Training', 
                fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(metrics_names)
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3, axis='y')
    
    # Tambahkan nilai di atas bar
    def autolabel(bars):
        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'{height:.3f}',
                       xy=(bar.get_x() + bar.get_width() / 2, height),
                       xytext=(0, 3),
                       textcoords="offset points",
                       ha='center', va='bottom',
                       fontsize=9)
    
    autolabel(bars1)
    autolabel(bars2)
    
    plt.tight_layout()
    plt.savefig(output_dir / 'comparison_bar_chart.png', dpi=300, bbox_inches='tight')
    print(f"✓ Grafik perbandingan disimpan: {output_dir / 'comparison_bar_chart.png'}")

def main():
    # Path ke file hasil training
    results_path = Path("runs/train/jamur_detector/results.csv")
    output_dir = Path("output/training_analysis")
    
    # Buat direktori output jika belum ada
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n🔍 Memuat data hasil training...")
    df = load_training_results(results_path)
    
    print("📊 Menghitung peningkatan metrik...")
    improvements = calculate_improvements(df)
    
    print_summary(df, improvements)
    
    print("\n📈 Membuat visualisasi grafik...")
    plot_training_metrics(df, output_dir)
    
    # Simpan data statistik ke file
    stats_file = output_dir / 'training_statistics.txt'
    with open(stats_file, 'w', encoding='utf-8') as f:
        f.write("="*70 + "\n")
        f.write(" RINGKASAN HASIL TRAINING MODEL YOLO ".center(70, "=") + "\n")
        f.write("="*70 + "\n\n")
        f.write(f"Total Epochs: {int(df['epoch'].max()) + 1}\n")
        f.write(f"Best Epoch (mAP@0.5): {df['metrics/mAP_0.5'].idxmax()}\n\n")
        
        f.write("METRIK PERFORMA:\n")
        f.write("-" * 70 + "\n")
        for metric_name, metric_key in [('Precision', 'metrics/precision'),
                                         ('Recall', 'metrics/recall'),
                                         ('mAP@0.5', 'metrics/mAP_0.5'),
                                         ('mAP@0.5:0.95', 'metrics/mAP_0.5:0.95')]:
            data = improvements[metric_key]
            f.write(f"\n{metric_name}:\n")
            f.write(f"  Awal      : {data['initial']:.6f}\n")
            f.write(f"  Akhir     : {data['final']:.6f}\n")
            f.write(f"  Terbaik   : {df[metric_key].max():.6f} (Epoch {df[metric_key].idxmax()})\n")
            if data['improvement_pct'] != float('inf'):
                f.write(f"  Peningkatan: {data['improvement_pct']:+.2f}%\n")
    
    print(f"✓ Statistik disimpan: {stats_file}")
    
    print("\n" + "="*70)
    print(" ANALISIS SELESAI! ".center(70, "="))
    print("="*70)
    print(f"\n📁 Semua hasil disimpan di: {output_dir.absolute()}")
    print("\nFile yang dihasilkan:")
    print("  1. performance_metrics.png - Grafik metrik performa")
    print("  2. loss_metrics.png - Grafik loss training & validasi")
    print("  3. combined_metrics.png - Grafik gabungan semua metrik")
    print("  4. comparison_bar_chart.png - Perbandingan awal vs akhir")
    print("  5. training_statistics.txt - Ringkasan statistik training")
    print()

if __name__ == "__main__":
    main()
