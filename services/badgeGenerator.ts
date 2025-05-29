import { createCanvas, loadImage, registerFont, Image } from "canvas";

import QRCode from "qrcode";

interface BadgeOptions {
	name: string;
	email: string;
	photoURL?: string | null | undefined;
}

registerFont("fonts/ArialCE.ttf", { family: "Arial CE" });

// Function to generate a stylish badge image as a Buffer
export async function generateBadge(options: BadgeOptions): Promise<Buffer> {
	const { name, email, photoURL } = options;
	console.log("Generating badge for:", name, "with photo URL:", photoURL);

	// Create a canvas (800x400 pixels) - wider format for a more modern look
	const canvas = createCanvas(800, 400);
	const ctx = canvas.getContext("2d");

	// Draw a clean white background
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, 800, 400);

	// Add a modern gradient sidebar
	const sidebarGradient = ctx.createLinearGradient(0, 0, 0, 400);
	sidebarGradient.addColorStop(0, "#6366f1"); // indigo
	sidebarGradient.addColorStop(0.5, "#8b5cf6"); // purple
	sidebarGradient.addColorStop(1, "#ec4899"); // pink
	ctx.fillStyle = sidebarGradient;
	ctx.fillRect(0, 0, 250, 400);

	// Add subtle pattern to the sidebar
	for (let i = 0; i < 15; i++) {
		const y = Math.random() * 400;
		const width = 50 + Math.random() * 100;

		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
		ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.1})`;
		ctx.lineWidth = 1 + Math.random() * 3;
		ctx.stroke();
	}

	// Add a subtle shadow to separate sidebar from main content
	ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
	ctx.fillRect(250, 0, 10, 400);

	// Add decorative geometric elements to main area
	ctx.fillStyle = "rgba(99, 102, 241, 0.03)";
	ctx.beginPath();
	ctx.moveTo(300, 50);
	ctx.lineTo(750, 50);
	ctx.lineTo(750, 150);
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = "rgba(236, 72, 153, 0.03)";
	ctx.beginPath();
	ctx.moveTo(750, 350);
	ctx.lineTo(550, 350);
	ctx.lineTo(750, 250);
	ctx.closePath();
	ctx.fill();

	// Add verified badge icon with modern styling
	ctx.beginPath();
	ctx.arc(700, 80, 30, 0, Math.PI * 2);
	ctx.fillStyle = "#6366f1";
	ctx.fill();

	// Draw checkmark using path with white color
	ctx.beginPath();
	ctx.moveTo(685, 80);
	ctx.lineTo(695, 90);
	ctx.lineTo(715, 70);
	ctx.lineWidth = 4;
	ctx.strokeStyle = "#ffffff";
	ctx.stroke();

	// Load and draw profile image with enhanced styling
	try {
		// Profile image container
		ctx.beginPath();
		ctx.arc(125, 150, 80, 0, Math.PI * 2);
		ctx.fillStyle = "#ffffff";
		ctx.fill();

		// If user has a profile photo, try to load and draw it
		if (photoURL) {
			try {
				console.log("Loading profile image from URL:", photoURL);
				const img = await loadImage(photoURL);

				// Create a circular clipping path
				ctx.save();
				ctx.beginPath();
				ctx.arc(125, 150, 75, 0, Math.PI * 2);
				ctx.clip();

				// Draw the image within the clipping path
				ctx.drawImage(img, 50, 75, 150, 150);
				ctx.restore();

				// Add subtle border around the photo
				ctx.beginPath();
				ctx.arc(125, 150, 75, 0, Math.PI * 2);
				ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
				ctx.lineWidth = 2;
				ctx.stroke();
			} catch (imgError) {
				console.error("Failed to load profile image:", imgError);
				// Fall back to drawing initials
				ctx.fillStyle = "#8b5cf6";
				ctx.font = "bold 60px 'ArialCE'";
				ctx.textAlign = "center";
				ctx.fillText(name.charAt(0).toUpperCase(), 125, 170);
			}
		} else {
			console.log("No profile photo URL provided, using initials");
			// If no photoURL, draw user initial
			ctx.fillStyle = "#8b5cf6";
			ctx.font = "bold 60px 'ArialCE'";
			ctx.textAlign = "center";
			ctx.fillText(name.charAt(0).toUpperCase(), 125, 170);
		}

		// Add visitor label in sidebar
		ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
		ctx.font = "bold 14px 'ArialCE'";
		ctx.textAlign = "center";
		ctx.fillText("PORTFOLIO VISITOR", 125, 260);

		// Add badge number in sidebar
		const badgeId = `AIML${Math.floor(1000 + Math.random() * 9000)}`;
		ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
		ctx.font = "12px 'ArialCE'";
		ctx.fillText(`Badge #${badgeId}`, 125, 280);

		// Add date in sidebar
		const currentDate = new Date().toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
		ctx.fillText(currentDate, 125, 300);
	} catch (error) {
		console.error("Error creating profile image on badge:", error);
	}

	// Main content area styling
	ctx.textAlign = "left";

	// Visitor name with modern styling
	ctx.fillStyle = "#1e293b"; // slate-800
	ctx.font = "bold 36px 'ArialCE'";

	// Ensure name fits within the badge
	const displayName = name.length > 20 ? name.substring(0, 17) + "..." : name;
	ctx.fillText(displayName, 300, 100);

	// Email with subtle styling
	ctx.fillStyle = "#64748b"; // slate-500
	ctx.font = "16px 'ArialCE'";
	const displayEmail =
		email.length > 30 ? email.substring(0, 27) + "..." : email;
	ctx.fillText(displayEmail, 300, 130);

	// Divider line
	ctx.beginPath();
	ctx.moveTo(300, 160);
	ctx.lineTo(750, 160);
	ctx.strokeStyle = "#e2e8f0"; // slate-200
	ctx.lineWidth = 1;
	ctx.stroke();

	// Badge of appreciation text
	ctx.fillStyle = "#64748b"; // slate-500
	ctx.font = "italic 16px 'ArialCE'";
	ctx.fillText("A badge of appreciation from", 300, 200);

	// Badge title
	ctx.fillStyle = "#1e293b"; // slate-800
	ctx.font = "bold 24px 'ArialCE'";
	ctx.fillText("Sayar Basu", 300, 230);

	// Subtitle
	ctx.fillStyle = "#475569"; // slate-600
	ctx.font = "18px 'ArialCE'";
	ctx.fillText("AI/ML Engineer & GenAI Specialist", 300, 260);

	// Add badge access level with pill shape
	ctx.beginPath();
	ctx.roundRect(300, 290, 180, 36, 18);
	ctx.fillStyle = "#6366f1"; // indigo-500
	ctx.fill();

	ctx.fillStyle = "white";
	ctx.font = "bold 16px 'ArialCE'";
	ctx.textAlign = "center";
	ctx.fillText("PORTFOLIO VISITOR", 390, 313);

	// Extract name from email if not provided
	let nameFromEmail = name;
	if (!name || name === "Guest") {
		// Extract name from email (e.g., john.doe@gmail.com -> John Doe)
		const emailParts = email.split("@")[0];
		nameFromEmail = emailParts
			.replace(/[.\-_]/g, " ")
			.split(" ")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ");
	}

	// Create a genuine QR code with visitor information
	try {
		// Get current date and time formatted nicely
		const visitDate = new Date().toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

		// Create QR code content with visitor info
		const qrContent = JSON.stringify({
			visitor: nameFromEmail,
			email: email,
			visited: visitDate,
			portfolio: "Sayar Basu - AI/ML Engineer",
		});

		// Generate QR code as data URL
		const qrCodeDataURL = await QRCode.toDataURL(qrContent, {
			errorCorrectionLevel: "M",
			margin: 1,
			color: {
				dark: "#6366f1", // indigo color for QR code
				light: "#ffffff", // white background
			},
			width: 100,
		});

		// Load the QR code image
		const qrImage = new Image();
		qrImage.onload = () => {};
		qrImage.src = qrCodeDataURL;

		// Draw QR code on the badge
		ctx.save();

		// Create a rounded rectangle for the QR code background
		ctx.beginPath();
		ctx.roundRect(650, 200, 100, 100, 10);
		ctx.fillStyle = "#ffffff";
		ctx.fill();
		ctx.strokeStyle = "#e2e8f0";
		ctx.lineWidth = 1;
		ctx.stroke();

		// Draw the QR code
		ctx.drawImage(qrImage, 655, 205, 90, 90);

		// Add a label above the QR code
		ctx.fillStyle = "#64748b"; // slate-500
		ctx.font = "10px 'ArialCE'";
		ctx.textAlign = "center";
		ctx.fillText("Scan to verify", 700, 195);

		ctx.restore();
	} catch (qrError) {
		console.error("Error generating QR code:", qrError);

		// Fallback to decorative QR code if generation fails
		ctx.fillStyle = "#f1f5f9"; // slate-100
		ctx.fillRect(650, 200, 100, 100);

		ctx.fillStyle = "#6366f1";
		ctx.font = "bold 10px 'ArialCE'";
		ctx.textAlign = "center";
		ctx.fillText(nameFromEmail.split(" ")[0].substring(0, 6), 700, 250);
	}

	// Convert canvas to buffer
	return canvas.toBuffer("image/png");
}
