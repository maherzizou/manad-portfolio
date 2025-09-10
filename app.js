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
	// Use same photos as the 3D slider template (dragon_*)
	const base = "assets/youtube_v2/slider_3d/images";
	const covers = Array.from(
		{ length: 10 },
		(_, i) => `${base}/dragon_${i + 1}.jpg`
	);
	return covers.map((src, i) => ({
		id: `tpl-${i + 1}`,
		title: `Template ${i + 1}`,
		subtitle: "Exemple visuel",
		excerpt: "Projet exemple (remplacer par vos dashboards).",
		featured: true,
		cover: src,
		images: [src],
		tags: ["Template"],
		highlights: ["Visuel de démonstration"],
		description: "Données de démonstration utilisées localement.",
	}));
}

// Featured 3D slider
function mountFeaturedSlider(projects) {
	const slider = $("#featuredSlider");
	if (!slider) return;

	// If requested, use the same image set as the original 3D template
	let list = [];
	if (slider.dataset.template === "slider3d") {
		const base = "assets/youtube_v2/slider_3d/images";
		list = Array.from({ length: 10 }, (_, i) => ({
			id: `tpl-${i + 1}`,
			title: `Template ${i + 1}`,
			cover: `${base}/dragon_${i + 1}.jpg`,
		}));
	} else {
		list = projects.filter((p) => p.featured);
	}

	const q = Math.max(1, list.length);
	slider.style.setProperty("--quantity", q);
	slider.innerHTML = list
		.map(
			(p, idx) => `
    <div class="item" style="--position:${idx + 1}" title="${p.title}">
      <figure>
        <img src="${p.cover}" alt="${p.title}" />
      </figure>
      <div class="badge">${p.title}</div>
    </div>
  `
		)
		.join("");

	// Click through (only if project exists in list)
	$$(".slider3d .item").forEach((el, i) => {
		el.addEventListener("click", () => {
			const p = list[i];
			if (p && p.id && !p.id.startsWith("tpl-")) {
				window.location.href = `project.html?id=${encodeURIComponent(p.id)}`;
			}
		});
	});
}

// Running strip chips (auto slider style)
function mountStrip(projects) {
    const base = projects.filter((p) => p.featured).length
        ? projects.filter((p) => p.featured)
        : projects;
    const track = $("#stripTrack");
    if (!track) return;

    // Build a single sequence in memory
    track.innerHTML = "";
    const frag = document.createDocumentFragment();
    const chips = base.map((p) => {
        const chip = document.createElement("a");
        chip.href = `project.html?id=${encodeURIComponent(p.id)}`;
        chip.className = "chip";
        chip.innerHTML = `<img src="${p.cover}" alt="${p.title}"><span>${p.title}</span>`;
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
    const speed = 140; // px per second
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
					)}">Voir le projet</a>
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
  const block = document.querySelector('#contact .contact-block');
  if (!block) return;

  // Magnetic CTA based on cursor position
  block.addEventListener('mousemove', (e) => {
    const rect = block.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    const tx = (x - 0.5) * 16; // px
    const ty = (y - 0.5) * 10; // px
    block.style.setProperty('--tx', tx.toFixed(1) + 'px');
    block.style.setProperty('--ty', ty.toFixed(1) + 'px');
    block.style.setProperty('--mx', Math.round(x * 100) + '%');
    block.style.setProperty('--my', Math.round(y * 100) + '%');
  });
  block.addEventListener('mouseleave', () => {
    block.style.setProperty('--tx', '0px');
    block.style.setProperty('--ty', '0px');
    block.style.setProperty('--mx', '50%');
    block.style.setProperty('--my', '50%');
  });

  // Reveal-driven activation + one-shot confetti burst
  let fired = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        block.classList.add('is-live');
        if (!fired) {
          fired = true;
          launchConfetti(block);
          setTimeout(() => launchConfetti(block, 12, 400), 500);
        }
      } else {
        // Hide effects when not visible; re-adding will replay animations
        block.classList.remove('is-live');
      }
    });
  }, { threshold: 0.4 });
  io.observe(block);
}

function launchConfetti(container, count = 22, spread = 0) {
  const colors = ['var(--grad-1)','var(--grad-2)','var(--grad-3)','var(--grad-4)','var(--grad-5)'];
  const rect = container.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'confetti';
    const left = Math.random() * rect.width; // px within block
    span.style.left = left + 'px';
    span.style.setProperty('--x', (Math.random() * 120 - 60 + (spread ? (Math.random()*spread - spread/2) : 0)) + 'px');
    span.style.setProperty('--r', (Math.random() * 360).toFixed(0) + 'deg');
    span.style.setProperty('--t', (1100 + Math.random() * 900).toFixed(0) + 'ms');
    span.style.setProperty('--d', (Math.random() * 250).toFixed(0) + 'ms');
    span.style.setProperty('--cf', colors[i % colors.length]);
    container.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  }
}

// Tag interactions (ripple on click)
function setupTags() {
  // Delegate click to support both static and injected elements
  document.addEventListener(
    'click',
    (e) => {
      // Tags ripple
      const tag = e.target.closest('.tags li');
      if (tag) {
        const rect = tag.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.4;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        tag.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
        return; // avoid also triggering card ripple
      }

      // Experience card ripple
      const card = e.target.closest('.exp-item');
      if (card) {
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.2; // balanced circle
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        card.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
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
		mountFeaturedSlider(projects);
		mountStrip(projects);
		mountGrid(projects);
		setupReveal();
		setupMeta();
		setupTags();
		setupContactFX();
	} catch (err) {
		console.error("Failed to init portfolio:", err);
	}
})();
