import { Component } from '@angular/core';
import { ImageUploaderComponent } from './image-uploader/image-uploader.component'; // ✅ Import child

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ImageUploaderComponent], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
