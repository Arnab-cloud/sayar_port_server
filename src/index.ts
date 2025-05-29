import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./services/routes";
import cors from "cors";
import process from "process";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// setup cors
const getAllowedOrigins = (): string[] => {
	const origins = [];

	// Development origins
	if (process.env.NODE_ENV === "development") {
		origins.push(
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:5173", // Vite default
			"http://127.0.0.1:3000",
			"http://127.0.0.1:5173"
		);
	}

	// Production origins from environment variables
	if (process.env.FRONTEND_URL) {
		origins.push(process.env.FRONTEND_URL);
	}

	// Add your specific Vercel domains
	if (process.env.VERCEL_DOMAINS) {
		const vercelDomains = process.env.VERCEL_DOMAINS.split(",");
		origins.push(...vercelDomains);
	}

	return origins;
};

const advancedCorsOptions: cors.CorsOptions = {
	origin: (origin, callback) => {
		const allowedOrigins = getAllowedOrigins();

		// Allow requests with no origin (mobile apps, etc.)
		if (!origin) return callback(null, true);

		// Check exact matches
		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		}

		// Check patterns for Vercel
		if (
			origin.endsWith(".vercel.app") ||
			origin.endsWith(".vercel.com") ||
			origin.includes("localhost") ||
			origin.includes("127.0.0.1")
		) {
			return callback(null, true);
		}

		return callback(new Error(`Origin ${origin} not allowed by CORS`));
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
	allowedHeaders: [
		"Origin",
		"X-Requested-With",
		"Content-Type",
		"Accept",
		"Authorization",
		"Cache-Control",
		"X-Access-Token",
	],
	exposedHeaders: ["X-Total-Count", "X-Page-Count"], // Headers to expose to frontend
	maxAge: 86400, // Preflight cache duration (24 hours)
};

// Use the advanced CORS setup
app.use(cors(advancedCorsOptions));

app.use((req, res, next) => {
	const start = Date.now();
	const path = req.path;
	let capturedJsonResponse: Record<string, any> | undefined = undefined;

	const originalResJson = res.json;
	res.json = function (bodyJson, ...args) {
		capturedJsonResponse = bodyJson;
		return originalResJson.apply(res, [bodyJson, ...args]);
	};

	res.on("finish", () => {
		const duration = Date.now() - start;
		if (path.startsWith("/api")) {
			let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
			if (capturedJsonResponse) {
				logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
			}

			if (logLine.length > 80) {
				logLine = logLine.slice(0, 79) + "…";
			}

			console.log(logLine);
		}
	});

	next();
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	const status = err.status || err.statusCode || 500;
	const message = err.message || "Internal Server Error";

	res.status(status).json({ message });
	throw err;
});

(async () => {
	const server = await registerRoutes(app);
	server.listen(PORT, () => {
		console.log(`serving on port ${PORT}`);
	});
})();
