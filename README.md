SmartCertify Angular 19 Frontend
The Umbele Angular 19 Frontend is the user interface for the Umbele online course certification platform. Built with Angular 19 using standalone components, this project provides a modern, responsive, and secure frontend that integrates seamlessly with the SmartCertify .NET 9 Web API and leverages Azure services for authentication, storage, and monitoring.
The application enables users to:

Browse and select available courses.
Start, pause, and resume certification tests.
Complete tests and receive digital certifications.
Access video references for enhanced learning.
Manage user profiles with secure authentication via Azure Entra ID.

Features

Modern UI: Built with Angular 19 standalone components, featuring lazy loading, signals for state management, and reactive data binding.
Secure Authentication: Integrated with Azure AD B2C for user authentication and role-based access control.
API Integration: Communicates with the SmartCertify .NET 9 Web API for course management, test processing, and user data.
Azure Integration:
Secure image uploads to Azure Blob Storage with SAS tokens.
Real-time monitoring with Azure Application Insights.
CI/CD pipelines via Azure DevOps for automated deployment.


Responsive Design: Optimized for desktop and mobile devices.
Error Handling: Global exception handling with Toastr notifications for user-friendly error feedback.

Tech Stack

Frontend: Angular 19 (standalone components), TypeScript, HTML, CSS
State Management: Angular Signals
API Communication: HttpClient with reusable services
Authentication: Azure AD B2C with MSAL
Deployment: Azure App Service with CI/CD via Azure DevOps
Monitoring: Azure Application Insights
Storage: Azure Blob Storage for secure image uploads

Prerequisites

Node.js: Version 18 or higher
Angular CLI: Version 19.0.4 or higher
Azure Account: For deployment and Azure services (Entra ID, App Service, Blob Storage, Application Insights)
Git: For version control

Installation

Clone the Repository:git clone https://github.com/Themba-01/umbele-ui-angular19.git


Navigate to the Project Directory:cd umbele-ui-angular19


Install Dependencies:npm install


Configure Environment:
Update src/environments/environment.ts and src/environments/environment.prod.ts with your Azure AD B2C settings, API endpoints, and Azure Blob Storage configurations.
Example:export const environment = {
  production: false,
  apiUrl: 'https://umbele-api.azurewebsites.net',
  azureAdB2c: {
    clientId: 'your-client-id',
    authority: 'https://your-tenant.ciam.com/your-tenant.onmicrosoft.com',
    knownAuthorities: ['your-tenant.ciam.com']
  },
  blobStorageUrl: 'https://your-storage-account.blob.core.windows.net'
};




Run the Development Server:ng serve


Open http://localhost:4200 in your browser to view the application.



Building for Production
To build the project for deployment:
ng build

The build artifacts will be stored in the dist/ directory, optimized for production.
Deployment
The application is deployed to Azure App Service using Azure DevOps CI/CD pipelines. To set up deployment:

Create an Azure App Service (F1 Free Plan or higher).
Set up an Azure DevOps project and repository.
Configure a CI/CD pipeline to build and deploy the Angular application.
Add environment variables (e.g., API URLs, Azure Entra ID settings) in the Azure App Service configuration.

Refer to the Azure DevOps documentation for detailed pipeline setup.
Project Structure

src/app/components: Contains standalone Angular components for courses, user tests, profile management, and more.
src/app/services: Reusable services for API calls, authentication, and data management.
src/app/models: TypeScript interfaces for data models (e.g., courses, exams, users).
src/environments: Configuration files for development and production environments.
src/assets: Static assets like images, SVGs, and icons.

Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit your changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.
Contact
For support or inquiries, contact the project maintainers via GitHub Issues.
