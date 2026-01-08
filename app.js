// Basic helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// Data load
async function loadProjects() {
	try {
		const res = await fetch("projects.json", { cache: "no-store" });
		if (!res.ok) throw new Error("projects.json not reachable");
		return await res.json();
	} catch (err) {
		console.warn("Falling back to template images:", err);
		return getFallbackProjects();
	}
}

function getFallbackProjects() {
	// Simple local placeholders if projects.json cannot be loaded
	const covers = [
		"assets/youtube_v2/slider_1/1.jpg",
		"assets/youtube_v2/slider_1/2.jpg",
		"assets/youtube_v2/slider_1/3.jpg",
	];
	return covers.map((src, i) => ({
		id: `tpl-${i + 1}`,
		title: `Formation ${i + 1}`,
		subtitle: "Exemple de module",
		excerpt: "Formation exemple (à personnaliser selon vos offres).",
		featured: true,
		cover: src,
		images: [src],
		tags: ["Formation"],
		highlights: ["Plan de formation à personnaliser"],
		description: "Données de démonstration utilisées localement.",
	}));
}

const stripItems = [
	{
		label: "Chaîne logistique",
		image: "assets/image-competence1.jpg",
	},
	{
		label: "Transformation digitale",
		image: "assets/image-competence2.jpg",
	},
	{
		label: "Power BI",
		image: "assets/image-competence3.jpg",
	},
	{
		label: "Amélioration continue",
		image: "assets/image-competence4.jpg",
	},
	{
		label: "Pilotage KPI",
		image: "assets/image-competence1.jpg",
	},
	{
		label: "Data analytics",
		image: "assets/image-competence2.jpg",
	},
	{
		label: "Qualité des données",
		image: "assets/image-competence3.jpg",
	},
	{
		label: "Reporting & dashboards",
		image: "assets/image-competence4.jpg",
	},
	{
		label: "Planification & S&OP",
		image: "assets/image-competence1.jpg",
	},
	{
		label: "Excellence opérationnelle",
		image: "assets/image-competence2.jpg",
	},
	{
		label: "Automatisation",
		image: "assets/image-competence3.jpg",
	},
	{
		label: "Gestion de la performance",
		image: "assets/image-competence4.jpg",
	},
];

// Running strip chips (auto slider style)
function mountStrip() {
	const track = $("#stripTrack");
	if (!track) return;
	track.setAttribute("role", "list");

	// Build a single sequence in memory
	track.innerHTML = "";
	const frag = document.createDocumentFragment();
	const chips = stripItems.map((item) => {
		const chip = document.createElement("div");
		chip.className = "chip";
		chip.setAttribute("role", "listitem");
		chip.innerHTML = `<img src="${item.image}" alt="${item.label}"><span>${item.label}</span>`;
		return chip;
	});
	chips.forEach((ch) => frag.appendChild(ch));
	track.appendChild(frag);

	// Measure base sequence width
	const container = track.parentElement;
	const seqWidth = track.scrollWidth; // width of one sequence
	const vw = container ? container.clientWidth : window.innerWidth;

	// Decide how many total sequences are needed so there is no gap
	// Ensure an even number of sequences so the -50% keyframe lands on a boundary
	const minK = Math.ceil(vw / Math.max(1, seqWidth)) + 1; // see analysis
	let K = Math.max(2, minK);
	if (K % 2 !== 0) K += 1; // make it even

	// We already have 1 sequence; append (K - 1) more
	for (let i = 1; i < K; i++) {
		chips.forEach((ch) => track.appendChild(ch.cloneNode(true)));
	}

	// Compute duration based on distance moved each loop (half of total width)
	const totalWidth = track.scrollWidth;
	const distancePerLoop = totalWidth / 2; // px (because keyframes go to -50%)
	const speed = 80; // px per second
	const duration = Math.max(18, Math.round(distancePerLoop / speed));

	// Start animation only when ready
	track.classList.add("marquee", "is-ready");
	track.style.setProperty("--marquee-duration", `${duration}s`);
}

// Projects grid
function mountGrid(projects) {
	const grid = $("#projectsGrid");
	if (!grid) return;
	grid.innerHTML = projects
		.map(
			(p) => `
    <article class="project-card" data-reveal>
      <a class="thumb" href="project.html?id=${encodeURIComponent(
				p.id
			)}" aria-label="${p.title}">
        <img src="${p.cover}" alt="${p.title}">
      </a>
      <div class="body">
        <div class="title">${p.title}</div>
        <div class="desc">${p.excerpt}</div>
        <ul class="tags">${(p.tags || [])
					.map((t) => `<li>${t}</li>`)
					.join("")}</ul>
        <div class="actions">
          <a class="btn-outline" href="project.html?id=${encodeURIComponent(
						p.id
					)}">Voir la formation</a>
        </div>
      </div>
    </article>
  `
		)
		.join("");
}

// Reveal on scroll
function setupReveal() {
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) {
					e.target.classList.add("show");
				} else {
					e.target.classList.remove("show");
				}
			});
		},
		{
			threshold: 0.12,
			rootMargin: "0px 0px -10% 0px",
		}
	);
	$$("[data-reveal], .project-card").forEach((el) => io.observe(el));
}

// Minor dynamic bits
function setupMeta() {
	const y = new Date().getFullYear();
	const yEl = document.getElementById("year");
	if (yEl) yEl.textContent = y;
	const l = document.getElementById("linkedinLink");
	if (l) l.href = "https://www.linkedin.com/in/mustapha-manad";
}

// Final contact section FX (border spin, aurora glow, magnetic CTA, confetti)
function setupContactFX() {
	const block = document.querySelector("#contact .contact-block");
	if (!block) return;

	// Magnetic CTA based on cursor position
	block.addEventListener("mousemove", (e) => {
		const rect = block.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width; // 0..1
		const y = (e.clientY - rect.top) / rect.height; // 0..1
		const tx = (x - 0.5) * 16; // px
		const ty = (y - 0.5) * 10; // px
		block.style.setProperty("--tx", tx.toFixed(1) + "px");
		block.style.setProperty("--ty", ty.toFixed(1) + "px");
		block.style.setProperty("--mx", Math.round(x * 100) + "%");
		block.style.setProperty("--my", Math.round(y * 100) + "%");
	});
	block.addEventListener("mouseleave", () => {
		block.style.setProperty("--tx", "0px");
		block.style.setProperty("--ty", "0px");
		block.style.setProperty("--mx", "50%");
		block.style.setProperty("--my", "50%");
	});

	// Reveal-driven activation + one-shot confetti burst
	let fired = false;
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) {
					block.classList.add("is-live");
					if (!fired) {
						fired = true;
						launchConfetti(block);
						setTimeout(() => launchConfetti(block, 12, 400), 500);
					}
				} else {
					// Hide effects when not visible; re-adding will replay animations
					block.classList.remove("is-live");
				}
			});
		},
		{ threshold: 0.4 }
	);
	io.observe(block);
}

function launchConfetti(container, count = 22, spread = 0) {
	const colors = [
		"var(--grad-1)",
		"var(--grad-2)",
		"var(--grad-3)",
		"var(--grad-4)",
		"var(--grad-5)",
	];
	const rect = container.getBoundingClientRect();
	for (let i = 0; i < count; i++) {
		const span = document.createElement("span");
		span.className = "confetti";
		const left = Math.random() * rect.width; // px within block
		span.style.left = left + "px";
		span.style.setProperty(
			"--x",
			Math.random() * 120 -
				60 +
				(spread ? Math.random() * spread - spread / 2 : 0) +
				"px"
		);
		span.style.setProperty("--r", (Math.random() * 360).toFixed(0) + "deg");
		span.style.setProperty(
			"--t",
			(1100 + Math.random() * 900).toFixed(0) + "ms"
		);
		span.style.setProperty("--d", (Math.random() * 250).toFixed(0) + "ms");
		span.style.setProperty("--cf", colors[i % colors.length]);
		container.appendChild(span);
		span.addEventListener("animationend", () => span.remove());
	}
}

// Tag interactions (ripple on click)
function setupTags() {
	// Delegate click to support both static and injected elements
	document.addEventListener(
		"click",
		(e) => {
			// Tags ripple
			const tag = e.target.closest(".tags li");
			if (tag) {
				const rect = tag.getBoundingClientRect();
				const size = Math.max(rect.width, rect.height) * 2.4;
				const ripple = document.createElement("span");
				ripple.className = "ripple";
				ripple.style.width = ripple.style.height = `${size}px`;
				ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
				ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
				tag.appendChild(ripple);
				ripple.addEventListener("animationend", () => ripple.remove());
				return; // avoid also triggering card ripple
			}

			// Experience card ripple
			const card = e.target.closest(".exp-item");
			if (card) {
				const rect = card.getBoundingClientRect();
				const size = Math.max(rect.width, rect.height) * 1.2; // balanced circle
				const ripple = document.createElement("span");
				ripple.className = "ripple";
				ripple.style.width = ripple.style.height = `${size}px`;
				ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
				ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
				card.appendChild(ripple);
				ripple.addEventListener("animationend", () => ripple.remove());
			}
		},
		{ passive: true }
	);
}

// (removed) Language meters numeric bubble per request; CSS handles dynamics now

// Init
(async function () {
	try {
		const projects = await loadProjects();
		mountStrip();
		mountGrid(projects);
		setupReveal();
		setupMeta();
		setupTags();
		setupContactFX();
	} catch (err) {
		console.error("Failed to init site:", err);
	}
})();
