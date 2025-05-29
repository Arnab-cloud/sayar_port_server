import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
// import { storage } from "./storage";
import { z, ZodError } from "zod";
import { sendBadgeEmail } from "./emailService";
import { generateBadge } from "./badgeGenerator";

// 📌 Validation schemas
const sendBadgeSchema = z.object({
	email: z.string().email(),
	name: z.string().nullable().optional(),
	photoURL: z.string().nullable().optional(),
});

const contactFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	subject: z.string().min(1, "Subject is required"),
	message: z.string().min(1, "Message is required"),
});

// 📌 Type definitions for request data
type SendBadgeData = z.infer<typeof sendBadgeSchema>;
type ContactFormData = z.infer<typeof contactFormSchema>;

export async function registerRoutes(app: Express): Promise<Server> {
	// 📌 Badge image generation handler
	const handleGenerateBadge = async (
		req: Request,
		res: Response
	): Promise<void> => {
		try {
			// Get data from query (GET) or body (POST)
			const rawData =
				req.method === "GET"
					? {
							name: req.query.name as string | undefined,
							email: req.query.email as string,
							photoURL: req.query.photoURL as string | undefined,
					  }
					: req.body;

			// Validate data
			const validatedData: SendBadgeData = sendBadgeSchema.parse(rawData);

			// Generate badge image
			const badgeBuffer = await generateBadge({
				name: validatedData.name || "Guest",
				email: validatedData.email,
				photoURL: validatedData.photoURL || null,
			});

			// Set response headers
			res.setHeader("Content-Type", "image/png");
			res.setHeader(
				"Cache-Control",
				"no-cache, no-store, must-revalidate"
			);
			res.setHeader("Pragma", "no-cache");
			res.setHeader("Expires", "0");

			// Attach download if POST or query.download=true
			if (req.method === "POST" || req.query.download === "true") {
				const filename = `${(validatedData.name || "guest")
					.toLowerCase()
					.replace(/\s+/g, "_")}_visitor_sayar_basu.png`;
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=${filename}`
				);
			}

			res.send(badgeBuffer);
		} catch (error) {
			console.error("Error generating badge:", error);
			res.status(500).json({
				success: false,
				message: "Failed to generate badge",
			});
		}
	};

	// Handle send badge
	const handleSendBadge = async (
		req: Request,
		res: Response
	): Promise<void> => {
		try {
			const data: SendBadgeData = sendBadgeSchema.parse(req.body);
			console.log("Received badge email request for:", data.email);

			// Generate badge image
			await generateBadge({
				name: data.name || "Guest",
				email: data.email,
				photoURL: data.photoURL || null,
			});
			console.log("Badge generated successfully");

			// Send email
			await sendBadgeEmail(
				data.email,
				data.name || "Guest",
				data.email,
				data.photoURL
			);
			console.log("Badge email sent successfully to:", data.email);

			res.status(200).json({
				success: true,
				message: "Badge email sent successfully",
			});
		} catch (error) {
			console.error("Error sending badge email:", error);

			if (error instanceof ZodError) {
				res.status(400).json({
					success: false,
					message: "Invalid request data",
					errors: error.errors,
				});
			} else {
				res.status(500).json({
					success: false,
					message: "Failed to send badge email",
				});
			}
		}
	};

	// Handle submission route
	const handleSubmissionRoute = async (
		req: Request,
		res: Response
	): Promise<void> => {
		try {
			const data: ContactFormData = contactFormSchema.parse(req.body);

			// Store contact submission (in-memory / log for demo)
			console.log("Contact form submission:", data);

			res.status(200).json({
				success: true,
				message: "Message received",
			});
		} catch (error) {
			console.error("Error processing contact form:", error);

			if (error instanceof ZodError) {
				res.status(400).json({
					success: false,
					message: "Invalid form data",
					errors: error.errors,
				});
			} else {
				res.status(500).json({
					success: false,
					message: "Failed to process contact form",
				});
			}
		}
	};

	// 📌 Register routes
	app.post("/api/generate-badge", handleGenerateBadge);
	app.get("/api/generate-badge", handleGenerateBadge);

	// 📌 Send badge email route
	app.post("/api/send-badge", handleSendBadge);

	// 📌 Contact form submission route
	app.post("/api/contact", handleSubmissionRoute);
	app.get("/ping", (req: Request, res: Response): void => {
		res.status(200).json({ msg: "Pong" });
	});

	// 📌 Create and return HTTP server instance
	const httpServer: Server = createServer(app);
	return httpServer;
}
