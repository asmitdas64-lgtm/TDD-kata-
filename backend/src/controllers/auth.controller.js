import { authService as defaultAuthService } from '../services/auth.service.js';

export class AuthController {
  constructor(authService = defaultAuthService) {
    this.authService = authService;
  }

  register = async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      const result = await this.authService.registerUser({ email, password, name });

      return res.status(201).json({
        success: true,
        data: result,
        error: null
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.loginUser({ email, password });

      return res.status(200).json({
        success: true,
        data: result,
        error: null
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req, res, next) => {
    try {
      const user = await this.authService.getCurrentUser(req.user.id);

      return res.status(200).json({
        success: true,
        data: { user },
        error: null
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
export default authController;
