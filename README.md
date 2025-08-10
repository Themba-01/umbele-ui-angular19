SmartCertify Angular 19 Frontend
Welcome to the SmartCertify Angular 19 Frontend! This project is the user interface for the SmartCertify online course certification platform, built with Angular 19 using standalone components. It integrates with a .NET 9 Web API following Clean Architecture principles and leverages Azure services for authentication, storage, and monitoring.
The frontend enables users to:

Browse and select available courses
Start, pause, and resume certification tests
Complete tests and receive digital certifications
Access video references for enhanced learning
Manage user profiles with secure authentication

Project Structure

src/app/components: Standalone Angular components for core features (e.g., courses, user tests, profile management)
src/app/services: Reusable services for API calls, authentication, and data management
src/app/models: TypeScript interfaces for data models (e.g., courses, exams, users)
src/app/pages: Page-level components for navigation (e.g., header, footer, about, contact)
src/app/guards: Route guards for authentication and authorization
src/environments: Configuration files for development and production environments
src/assets: Static assets (e.g., images, SVGs, icons)
Root: Configuration files (angular.json, package.json, tsconfig.json) for Angular setup

Project Setup
Requirements

Node.js: Version 18 or higher
Angular CLI: Version 19.0.4 or higher
Git: For version control
Azure Account: For deployment and services (Azure AD B2C, App Service, Blob Storage, Application Insights)
Text Editor: Visual Studio Code or similar

Installation

Clone this repository:
git clone https://github.com/Themba-01/umbele-ui-angular19.git


Navigate to the project directory:
cd umbele-ui-angular19


Install dependencies:
npm install


Configure environment settings:

Update src/environments/environment.ts and src/environments/environment.prod.ts with your Azure AD B2C settings, API endpoints, and Azure Blob Storage configurations
Example:export const environment = {
  production: false,
  apiUrl: 'https://smartcertify-api.azurewebsites.net',
  azureAdB2c: {
    clientId: 'your-client-id',
    authority: 'https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/B2C_1_signup_signin',
    knownAuthorities: ['your-tenant.b2clogin.com']
  },
  blobStorageUrl: 'https://your-storage-account.blob.core.windows.net'
};




Run the development server:
ng serve


Open http://localhost:4200 in your browser to view the application



Building for Production
To build the project for deployment:
ng build


Build artifacts are stored in the dist/ directory, optimized for production

Deployment
The application is deployed to Azure App Service using Azure DevOps CI/CD pipelines. To set up deployment:

Create an Azure App Service (F1 Free Plan or higher)
Set up an Azure DevOps project and repository
Configure a CI/CD pipeline to build and deploy the Angular application
Add environment variables (e.g., API URLs, Azure AD B2C settings) in the Azure App Service configuration

Refer to the Azure DevOps documentation for pipeline setup details.
Features

Modern UI: Built with Angular 19 standalone components, featuring lazy loading and reactive data binding
State Management: Utilizes Angular Signals for efficient state handling
API Integration: Communicates with the SmartCertify .NET 9 Web API for course, test, and user data
Secure Authentication: Integrated with Azure AD B2C for user login and role-based access control
Azure Integration:
Secure image uploads to Azure Blob Storage with SAS tokens
Real-time monitoring with Azure Application Insights
Automated deployment via Azure DevOps CI/CD


Error Handling: Global HTTP interceptor with Toastr notifications for user-friendly error feedback
Responsive Design: Optimized for desktop and mobile devices

Tech Stack

Frontend: Angular 19 (standalone components), TypeScript, HTML, CSS
State Management: Angular Signals
API Communication: HttpClient with reusable services
Authentication: Azure AD B2C with MSAL
Deployment: Azure App Service with CI/CD via Azure DevOps
Monitoring: Azure Application Insights
Storage: Azure Blob Storage for secure image uploads

Contributing
Contributions are welcome! To contribute:

Fork the repository
Create a feature branch (git checkout -b feature/your-feature)
Commit your changes (git commit -m "Add your feature")
Push to the branch (git push origin feature/your-feature)
Open a pull request

License
This project is licensed under the MIT License. See the LICENSE file for details.
Contact
For support or inquiries, contact the project maintainers via GitHub Issues.
