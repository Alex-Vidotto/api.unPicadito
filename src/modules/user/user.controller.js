import * as userService from "./user.service";
export const searchPlayers = async (req, res) => {
    try {
        const term = req.query.q;
        const players = await userService.searchPlayers(term);
        res.status(200).json(players);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
