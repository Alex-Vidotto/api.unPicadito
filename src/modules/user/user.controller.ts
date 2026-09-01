import { Request, Response } from "express";
import { UserService } from "./user.service";

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.userService.register(req.body);
            res.status(201).json(response);
        } catch (error: any) {
            if (error.status && error.message) {
                res.status(error.status).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: "Internal server error" });
        }
    };

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.userService.login(req.body);
            res.status(200).json(response);
        } catch (error: any) {
            if (error.status && error.message) {
                res.status(error.status).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: "Internal server error" });
        }
    };
}