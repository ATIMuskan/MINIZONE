import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ImageService } from './image.service';
import { NavbarComponent } from '../navbar/navbar.component';

interface ProductImageData {
  _id: string;
  name: string;
  size: string;
  uploadTime: string;
  url: string;
  mimetype: string;
  isLoading?: boolean;
}

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [CommonModule, DatePipe, NavbarComponent],
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.css']
})
export class ImageUploaderComponent implements OnInit {
  productImages: ProductImageData[] = [];
  galleryError: string = '';
  galleryViewMode: 'grid' | 'list' = 'grid';
  zoomMode: 'hover' | 'click' | 'toggle' = 'click';
  magnification = 5;

  isZooming = false;
  zoomedImageUrl: string | null = null;
  zoomLensY = 0;
  zoomLensX = 0;
  zoomBackgroundPosition = '0px 0px';
  zoomBackgroundSize = '200% 200%';

  constructor(private imageService: ImageService) {}

  ngOnInit(): void {
    this.loadProductImages();
  }

  loadProductImages(): void {
    this.imageService.getProductImages().subscribe({
      next: (data) => {
        this.productImages = data.map((img: any) => ({
          _id: img._id,
          name: img.name || img.originalname,
          size: img.size,
          uploadTime: img.uploadTime || img.createdAt,
          url: this.getProductImageUrl(img.path),
          mimetype: img.mimetype,
          isLoading: false
        }));
      },
      error: (err: any) => {
        this.galleryError = 'Failed to load images.';
      }
    });
  }

  onProductFileInput(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.galleryError = '';
    for (const file of files) {
      if (!/image\/(jpeg|png)/.test(file.type)) {
        this.galleryError = 'Only JPEG and PNG files are allowed.';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.galleryError = 'File size must be less than 10MB.';
        return;
      }
    }
    for (const file of files) {
      // Add a temporary loading image card
      const tempId = 'temp-' + Date.now() + Math.random();
      this.productImages.unshift({
        _id: tempId,
        name: file.name,
        size: this.formatFileSize((file.size / 1024).toFixed(2) + ' KB'),
        uploadTime: new Date().toISOString(),
        url: '',
        mimetype: file.type,
        isLoading: true
      });
      this.uploadProductImage(file, tempId);
    }
    event.target.value = '';
  }

  uploadProductImage(file: File, tempId: string): void {
    this.imageService.uploadProductImage(file).subscribe({
      next: (res: any) => {
        setTimeout(() => {
          const img = res.image;
          const idx = this.productImages.findIndex(i => i._id === tempId);
          if (idx > -1) {
            this.productImages[idx] = {
              _id: img._id,
              name: img.name || img.originalname,
              size: img.size,
              uploadTime: img.uploadTime || img.createdAt,
              url: this.getProductImageUrl(img.path),
              mimetype: img.mimetype,
              isLoading: false
            };
          }
        }, 2000); // 2 seconds delay
      },
      error: (err: any) => {
        setTimeout(() => {
          this.galleryError = 'Failed to upload image.';
          this.productImages = this.productImages.filter(i => i._id !== tempId);
        }, 2000);
      }
    });
  }

  removeProductImage(imageId: string): void {
    const idx = this.productImages.findIndex(img => img._id === imageId);
    if (idx > -1) {
      this.productImages[idx].isLoading = true;
    }
    this.imageService.removeProductImage(imageId).subscribe({
      next: () => {
        setTimeout(() => {
          this.productImages = this.productImages.filter(img => img._id !== imageId);
        }, 2000);
      },
      error: () => {
        setTimeout(() => {
          this.galleryError = 'Failed to delete image.';
          if (idx > -1) {
            this.productImages[idx].isLoading = false;
          }
        }, 2000);
      }
    });
  }

  replaceProductImage(imageId: string, event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    if (!/image\/(jpeg|png)/.test(file.type)) {
      this.galleryError = 'Only JPEG and PNG files are allowed.';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.galleryError = 'File size must be less than 10MB.';
      return;
    }
    this.galleryError = '';
    const idx = this.productImages.findIndex(img => img._id === imageId);
    if (idx > -1) {
      this.productImages[idx].isLoading = true;
    }
    this.imageService.replaceProductImage(imageId, file).subscribe({
      next: (res: any) => {
        setTimeout(() => {
          const img = res.image;
          if (idx > -1) {
            this.productImages[idx] = {
              _id: img._id,
              name: img.name || img.originalname,
              size: img.size,
              uploadTime: img.uploadTime || img.createdAt,
              url: this.getProductImageUrl(img.path),
              mimetype: img.mimetype,
              isLoading: false
            };
          }
        }, 2000);
      },
      error: () => {
        setTimeout(() => {
          this.galleryError = 'Failed to replace image.';
          if (idx > -1) {
            this.productImages[idx].isLoading = false;
          }
        }, 2000);
      }
    });
    event.target.value = '';
  }

  setGalleryViewMode(mode: 'grid' | 'list'): void {
    this.galleryViewMode = mode;
  }

  trackByProductId(index: number, item: ProductImageData): string {
    return item._id;
  }

  formatFileSize(size: string): string {
    return size;
  }

  getTotalGallerySize(): string {
    let totalBytes = 0;
    for (const img of this.productImages) {
      if (img.size.includes('MB')) {
        totalBytes += parseFloat(img.size) * 1024 * 1024;
      } else if (img.size.includes('KB')) {
        totalBytes += parseFloat(img.size) * 1024;
      } else {
        totalBytes += parseFloat(img.size);
      }
    }
    if (totalBytes > 1024 * 1024) {
      return (totalBytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (totalBytes > 1024) {
      return (totalBytes / 1024).toFixed(2) + ' KB';
    } else {
      return totalBytes + ' B';
    }
  }

  getGallerySuccessRate(): number {
    return 100;
  }

  calculateProductPrice(size: string): string {
    const sizeNum = parseFloat(size);
    let basePrice = 9.99;
    if (size.includes('MB')) {
      basePrice = sizeNum * 3.99;
    } else if (size.includes('KB')) {
      basePrice = sizeNum * 0.01;
    }
    return Math.max(0.99, basePrice).toFixed(2);
  }

  getProductImageUrl(path: string): string {
    if (!path) return '';
    return `http://localhost:5000${path}`;
  }

  handleImageZoom(event: MouseEvent, imageUrl: string) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const percentX = x / rect.width;
    const percentY = y / rect.height;

    this.isZooming = true;
    this.zoomedImageUrl = imageUrl;
    this.zoomLensY = y - 50;
    this.zoomLensX = x - 50;
    this.zoomBackgroundPosition = `${-percentX * rect.width}px ${-percentY * rect.height}px`;
    this.zoomBackgroundSize = `${rect.width * 2}px ${rect.height * 2}px`;
  }

  hideImageZoom() {
    this.isZooming = false;
    this.zoomedImageUrl = null;
  }
}