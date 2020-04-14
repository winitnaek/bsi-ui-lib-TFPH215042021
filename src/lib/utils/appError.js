class AppError extends Error {
    constructor (message, status) {
    
      // Calling parent constructor of base Error class.
      super(message);
      
      // Saving class name in the property of our custom error as a shortcut.
      this.type = 'AppError';
  
      // Capturing stack trace, excluding constructor call from it.
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
        this.stack = this.stack;
      }else{
        this.stack = this.stack;
      }
      // You can use any additional properties you want.
      // I'm going to use preferred HTTP status for this error types.
      // `500` is the default value if not specified.
      this.status = status || 500;
      
    }
  }
  export default AppError;