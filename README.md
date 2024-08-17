# ModelHub Interact

The ModelHub Interact project is a web application that serves as an AI chatbot interface to Modelhub, a machine learning model repository. It allows users to interact, understand and run dozens of models without any technical knowledge needed. Powered by OpenAI's GPTs.

# Install locally

1. Clone the repository to a directory on your PC via the command prompt:

    ```bash
    git clone https://github.com/Jerrykinss/ModelHub-Interact
    ```

2. Open the folder:

    ```bash
    cd ModelHub-Interact
    ```

3. Rename the `.example.env` to `.env`:

    ```bash
    mv .example.env .env
    ```

4. Install dependencies:

    ```bash
    npm install
    ```

5. Start the development server:

    ```bash
    npm run dev
    ```

6. Go to [localhost:3000](http://localhost:3000) and start interacting with various models!

# Tech Stack

[NextJS](https://nextjs.org/) - React Framework for the Web

[TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework

[shadcn-ui](https://ui.shadcn.com/) - UI component built using Radix UI and Tailwind CSS

[Modelhub](http://modelhub.ai/) - Open source machine learning model repository