import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ProductService } from './product.service';
import { AuthService } from './auth.service';
import { User } from './User';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm, FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService } from './storage.service';
import { Product } from './product';
import { ModalService } from './modal.service';
import { TracingService } from './tracing.service'; // Import TracingService

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Tp3Front';
  public products: Product[] = [];
  public isLoggedIn = false;
  public showRegister = false;
  public editProduct: Product;
  public deleteProduct: Product;
  loginForm: FormGroup;
  registerForm: FormGroup;
  loginError: string = '';
  registerError: string = '';

  constructor(
    private storageService: StorageService,
    private productService: ProductService,
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private modalService: ModalService,
    private tracingService: TracingService // Inject TracingService
  ) {
    this.editProduct = {
      id: '',
      name: '',
      price: 0,
      expirationDate: new Date()
    };
    this.deleteProduct = {
      id: '',
      name: '',
      price: 0,
      expirationDate: new Date()
    };

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    const span = this.tracingService.createSpan('sampleOperation');
    console.log('AppComponent initialized');
    this.getProducts();
    span.addEvent('first operation');

  }

  public getProducts(): void {
    const span = this.tracingService.createSpan('getProducts');

    this.productService.getAllProducts().subscribe(
      (response: Product[]) => {
        this.products = response;
        span.addEvent('Products fetched successfully');
        span.setStatus({ code: 0 }); // Success
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        span.setStatus({ code: 1, message: error.message }); // Error
      },
      () => {
        span.end(); // End span in the complete callback
      }
    );
    span.addEvent('Fetching all products');

  }

  public onAddProduct(addForm: NgForm): void {
    const span = this.tracingService.createSpan('onAddProduct');
    span.addEvent('Starting to add product'); // Ajouté au début
  
    if (addForm.valid) { // Vérification de la validité du formulaire
      const productData = { ...addForm.value }; // Création d'une copie des données
  
      // Log pour déboguer
      console.log('Sending product data:', productData);
  
      this.productService.createProduct(productData).subscribe({
        next: (response: Product) => {
          console.log('Product added successfully:', response);
          this.getProducts();
          addForm.reset();
          span.addEvent('Product added successfully');
          span.setStatus({ code: 0 });
          
          // Fermer le modal après succès
          document.getElementById('addProductModal')?.click();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error adding product:', error);
          span.addEvent('Error adding product: ' + error.message);
          span.setStatus({ code: 1, message: error.message });
          
          // Message d'erreur plus détaillé
          if (error.status === 400) {
            alert('Erreur de validation des données. Veuillez vérifier les informations saisies.');
          } else {
            alert('Une erreur est survenue lors de l\'ajout du produit: ' + error.message);
          }
        },
        complete: () => {
          span.end();
        }
      });
    } else {
      span.addEvent('Form validation failed');
      span.setStatus({ code: 1, message: 'Invalid form data' });
      span.end();
      alert('Veuillez remplir tous les champs obligatoires correctement.');
    }
  }

  public onUpdateProduct(product: Product): void {
    const span = this.tracingService.createSpan('onUpdateProduct');

    this.productService.updateProduct(product).subscribe(
      (response: Product) => {
        console.log(response);
        this.getProducts();
        span.addEvent('Product updated successfully');
        span.setStatus({ code: 0 }); // Success
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        span.setStatus({ code: 1, message: error.message }); // Error
      },
      () => {
        span.end(); // End span in the complete callback
      }
    );
    span.addEvent('Updating product');

  }

  public onDeleteProduct(productId: string): void {
    const span = this.tracingService.createSpan('onDeleteProduct');

    this.productService.deleteProduct(productId).subscribe(
      (response: void) => {
        console.log(response);
        this.getProducts();
        span.addEvent('Product deleted successfully');
        span.setStatus({ code: 0 }); // Success
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        span.setStatus({ code: 1, message: error.message }); // Error
      },
      () => {
        span.end(); // End span in the complete callback
      }
    );
        span.addEvent('Deleting product');

  }

  public searchProducts(key: string): void {
    const results: Product[] = [];
    for (const product of this.products) {
      if (product.name.toLowerCase().indexOf(key.toLowerCase()) !== -1) {
        results.push(product);
      }
    }
    this.products = results;
    if (!key) {
      this.getProducts();
    }
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const span = this.tracingService.createSpan('onLoginSubmit');
      span.addEvent('Submitting login form');

      this.auth.login(email, password).subscribe({
        next: (response) => {
          if (response && response.token) {
            this.storageService.setItem('authToken', response.token);
            this.isLoggedIn = true;
            this.loginError = '';
            this.router.navigate(['/api/products']);
            span.addEvent('Login successful');
            span.setStatus({ code: 0 }); // Success
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.loginError = 'Login failed. Please check your credentials.';
          span.setStatus({ code: 1, message: error.message }); // Error
        },
        complete: () => {
          span.end(); // End span in the complete callback
        }
      });
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      const user: User = this.registerForm.value;
      const span = this.tracingService.createSpan('onRegisterSubmit');
      span.addEvent('Submitting registration form');

      this.auth.register(user).subscribe({
        next: (response) => {
          this.registerError = '';
          this.showRegister = false;
          this.loginForm.patchValue({
            email: user.email,
            password: user.password,
           isLoggedIn :true
          });
          span.addEvent('Registration successful');
          span.setStatus({ code: 0 }); // Success
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.registerError = 'Registration failed. Please try again.';
          span.setStatus({ code: 1, message: error.message }); // Error
        },
        complete: () => {
          span.end(); // End span in the complete callback
        }
      });
    }
  }

  logout(): void {
    this.storageService.removeItem('authToken');
    this.isLoggedIn = false;
    this.products = [];
  }

  public OnOpenModal(product: Product | null, mode: string): void {
    if (mode === 'edit' && product) {
      this.editProduct = product;
      this.modalService.open('updateProductModal');
    }
    if (mode === 'delete' && product) {
      this.deleteProduct = product;
      this.modalService.open('deleteProductModal');
    }
  }

  public OnOpenModalAdd(mode: string): void {
    if (mode === 'add') {
      this.modalService.open('addProductModal');
    }
  }

  closeModal(id: string): void {
    this.modalService.close(id);
  }
}
