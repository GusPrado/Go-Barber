import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';
import User from '../models/User';
import File from '../models/File';

class AppointmentController {
    async index(req, res) {
        const { page } = req.query;

        const appointments = await Appointment.findAll({
            where: { user_id: req.userId, canceled_at: null },
            order: ['date'],
            limit: 20,
            offset: (page - 1) * 20,
            attributes: ['id', 'date'],
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id', 'path', 'url']
                        }
                    ]
                }
            ]
        });

        return res.json(appointments);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            date: Yup.date().required()
        });

        if (!schema.isValid(req.body)) {
            return res.status(400).json({ error: 'Validation failed' });
        }

        const { provider_id, date } = req.body;

        // Check if a provider_id is really a provider
        const isProvider = await User.findOne({
            where: { id: provider_id, provider: true }
        });

        if (!isProvider) {
            return res.status(401).json({
                error: 'You can only create appointments with providers'
            });
        }

        // Avoid provider to create appointment for himself
        if (provider_id === req.userId) {
            return res.status(401).json({
                error: 'You cannot create appointments to yourself'
            });
        }

        // Check for past dates
        const hourStart = startOfHour(parseISO(date));

        if (isBefore(hourStart, new Date())) {
            return res
                .status(400)
                .json({ error: 'Past dates are not allowed' });
        }

        // Check date availability
        const checkAvailability = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart
            }
        });

        if (checkAvailability) {
            return res
                .status(400)
                .json({ error: 'Appointment date/time is not available' });
        }

        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date: hourStart
        });

        // Notify appointments to provider
        const user = await User.findByPk(req.userId);
        const formattedDate = format(hourStart, "dd 'de' MMMM', às' H:mm'h'", {
            locale: pt
        });

        await Notification.create({
            content: `Novo agendamento para ${user.name} no dia ${formattedDate}`,
            user: provider_id
        });

        return res.json(appointment);
    }
}

export default new AppointmentController();
