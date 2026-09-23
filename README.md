# K-Map Solver (Karnaugh Map Visualizer)

An interactive, web-based **Karnaugh Map (K-Map) Solver and Visualizer** designed to simplify boolean algebra, minterm/maxterm simplification, and digital logic design. Built with modern web technologies, it features textbook-style visual grouping (including wrap-around and 4-corner open-bracket curves), LaTeX/TikZ code generation, and full SVG/Image exporting.

## Key Features

### Core Logic & Solving

* **Multi-Variable Support:** Solves 2, 3, 4, 5 and 6-variable Karnaugh Maps.
* **Flexible Input Modes:** Supports Truth Tables, Minterms ($\sum m$), Maxterms ($\prod M$), and Don't Care ($\mathbf{d}$) conditions.
* **SOP & POS Forms:** Instant simplification into both Sum-of-Products (SOP) and Product-of-Sums (POS) minimal expressions.
* **Step-by-Step Implicant Breakdown:** Clearly lists Prime Implicants (PI) and Essential Prime Implicants (EPI).

### Advanced Visualizations

* **Textbook Corner Wrap-Around Grouping:** Clean 4-corner open-bracket SVG curves ($m_0, m_2, m_8, m_{10}$) matching standard digital design textbooks.
* **Interactive Grid:** Real-time cell highlights, decimal minterm subscripts, and color-coded loop overlays.
* **Export & Sync:**
* Generate and copy publication-ready **LaTeX TikZ** code.
* Export vector SVG diagrams directly for lab reports and academic papers.

### Academic & Institutional Integration

* **Direct Queries & Feedback System:** Integrated inquiry form for academic support, feature requests, bug reports, and IT assistance.
* **Automated Routing:** Contact and feedback submissions are delivered directly to `megaitdepartment@gmail.com`.

## Institutional Info & Credits

Developed in collaboration with the Digital Logic Lab and Department of Information Technology at **Mega National College**.

* **Institution:** Mega National College, Kumaripati, Lalitpur, Nepal
* **Official Website:** [megacollege.edu.np](https://megacollege.edu.np/?utm_source=gemini)
* **Mega IT LinkedIn:** [Mega IT Department](https://www.linkedin.com/in/mega-it-bb2bb6438/?utm_source=gemini)
* **Department Email:** `megaitdepartment@gmail.com`

## Tech Stack

* **Frontend Framework:** React (TypeScript)
* **Styling & UI:** Tailwind CSS / Lucide Icons
* **Vector Rendering:** SVG for dynamic K-Map loops and wrap-around rendering
* **Backend / API:** Node.js / Express (handling `/api/contact` queries and email routing)
* **Math Formatting:** LaTeX / TikZ integration

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

* **Node.js** (v18.x or higher)
* **npm** or **yarn**

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/kmap-solver.git
cd kmap-solver

```


2. **Install dependencies:**
```bash
npm install

```


3. **Configure Environment Variables:**
Create a `.env` file in the root directory and configure your server settings (e.g., SMTP/Email dispatch credentials for query handling):
```env
PORT=5000
RECIPIENT_EMAIL=megaitdepartment@gmail.com
# Add your SMTP provider details if using automated server routing

```
4. **Run the Development Server:**
```bash
npm run dev

```


Open `http://localhost:5173` (or the port specified in your console) to view the application in your browser.

5. **Build for Production:**
```bash
npm run build

```



---

## 📂 Project Structure

```
├── src/
│   ├── components/
│   │   ├── KMapVisualizer.tsx   # SVG Grid rendering & corner grouping logic
│   │   ├── Navbar.tsx           # Navigation bar & quick action buttons
│   │   ├── Footer.tsx           # Institutional details, contacts, and social links
│   │   └── ContactModal.tsx     # Interactive query, feedback & bug submission modal
│   ├── utils/
│   │   ├── kmapSolver.ts        # Quine-McCluskey / Petrick's reduction algorithm
│   │   └── latexGenerator.ts    # LaTeX TikZ diagram exporter
│   ├── App.tsx                  # Main layout and app state initialization
│   └── main.tsx                 # Entry point
├── server.ts                    # Backend API router for contact forms
├── package.json
└── README.md

```

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## Contact & Support

For queries, bug reports, feature requests, or academic contributions, feel free to reach out via the built-in app submission form or email directly at **[megaitdepartment@gmail.com]**.
