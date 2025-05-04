
# API Configuration Guide

This application uses a central API key for all users by default. For production deployment, you can override the API key using an environment variable.

## Environment Variables

To override the default API key, set the following environment variable:

```
VITE_OPENAI_API_KEY=your_api_key_here
```

## Local Development

For local development or testing without an environment file, the application will use the default API key embedded in the code.

## Security Considerations

- In a production environment, always use environment variables for sensitive data like API keys.
- Never commit your actual API keys to version control.
- Consider using a secrets management service for production deployments.
