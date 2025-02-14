class MicroserviceError(Exception):
    """Custom exception for microservice communication errors."""
    
    def __init__(self, status_code, message, response_text=None):
        self.status_code = status_code
        self.message = message
        self.response_text = response_text 
        super().__init__(f"[{status_code}] {message}: {response_text}")
