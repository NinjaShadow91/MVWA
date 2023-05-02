# Modern Vulnerable Web Application

A deliberately vulnerable e-commerce web application built with modern technologies, designed to help web developers and security enthusiasts learn about common web application vulnerabilities in a legal and realistic environment.

## Features

### Real-World Vulnerabilities

- Incorporating real-world vulnerabilities based on the OWASP Top Ten list, our web application offers users valuable experience with common and critical security risks.

### Modern Technology Stack

- Utilizing a modern technology stack, including Next.js, tRPC, NextAuth, and PostgreSQL, the project provides exposure to contemporary web development practices and potential security pitfalls.

### Practical Learning Experience

- Designed to simulate an actual e-commerce platform, the application allows users to understand how vulnerabilities arise in real-world applications and practice exploiting and mitigating them.

## Vulnerabilities

The project includes several intentional vulnerabilities such as:

1. Broken Authentication
2. Cross-Site Scripting (XSS)
3. Server-Side Request Forgery (SSRF)
4. Command Injection
5. SQL Injection (SQLi)
6. Broken Access Control

Detailed explanations of these vulnerabilities and their exploitation techniques are provided in the [project documentation](./docs/experiments.md).

## Installation

1. Clone the repository:
`git clone https://github.com/your-username/vulnerable-ecommerce-webapp.git`

2. Install dependencies:
`cd vulnerable-ecommerce-webapp
npm install`

3. Create a `.env.local` file and configure the necessary environment variables, such as database credentials, authentication provider keys, etc.

4. Run the development server:
`npm run dev`

5. Open your browser and navigate to `http://localhost:3000` to access the web application.

## Contribution Guidelines

1. **Fork the repository**: Start by forking the project repository to your own GitHub account.

2. **Create a new branch**: After cloning the forked repository to your local machine, create a new branch for your feature or bug fix.

3. **Code**: Implement your contribution, ensuring it follows the project's coding style and standards.

4. **Test**: Test your changes thoroughly, making sure they don't introduce new bugs or break existing functionality.

5. **Document**: Update any relevant documentation or add comments to your code to explain your changes.

6. **Commit**: Commit your changes with a clear and descriptive commit message.

7. **Submit a pull request**: Push your changes to your forked repository and create a pull request against the original project. Provide a detailed description of your contribution and the problem it solves.

8. **Participate in the review process**: Engage in the review process by addressing any feedback or requested changes from the project maintainers.

By following these guidelines, you can contribute effectively to the project and help improve its security features for the benefit of all users.

## License

This project is licensed under the [GNU General Public License v3.0](./COPYING).
