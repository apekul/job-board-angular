import 'dotenv/config';
import { pool } from './db/index.js';
import { CREATE_JOBS_TABLE } from './db/schema.js';

type SeedJob = {
  title: string;
  company: string;
  location: string;
  workMode: 'remote' | 'onsite' | 'hybrid';
  salaryMin: number;
  salaryMax: number;
  technologies: string[];
  level: 'junior' | 'mid' | 'senior';
  description: string;
  postedDaysAgo: number;
};

const jobs: SeedJob[] = [
  {
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Warsaw',
    workMode: 'remote',
    salaryMin: 12000,
    salaryMax: 18000,
    technologies: ['Angular', 'TypeScript', 'TailwindCSS', 'RxJS'],
    level: 'mid',
    description:
      '<p>We are looking for a skilled <strong>Frontend Developer</strong> to join our growing team and build high-quality web applications with Angular.</p>',
    postedDaysAgo: 2,
  },
  {
    title: 'Backend Engineer',
    company: 'DataSystems',
    location: 'Krakow',
    workMode: 'onsite',
    salaryMin: 15000,
    salaryMax: 22000,
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'TypeScript', 'Docker'],
    level: 'senior',
    description:
      '<p>We are hiring a <strong>Backend Engineer</strong> to design and build scalable REST APIs with Node.js and PostgreSQL.</p>',
    postedDaysAgo: 5,
  },
  {
    title: 'Junior React Developer',
    company: 'StartupHub',
    location: 'Wroclaw',
    workMode: 'remote',
    salaryMin: 6000,
    salaryMax: 9000,
    technologies: ['React', 'JavaScript', 'CSS', 'Git'],
    level: 'junior',
    description:
      '<p>Great opportunity for a <strong>Junior React Developer</strong> to kickstart a career in a fast-paced startup.</p>',
    postedDaysAgo: 1,
  },
  {
    title: 'Full Stack Developer',
    company: 'Innovate Solutions',
    location: 'Gdansk',
    workMode: 'hybrid',
    salaryMin: 14000,
    salaryMax: 20000,
    technologies: ['Vue.js', 'Node.js', 'MongoDB', 'GraphQL', 'AWS'],
    level: 'senior',
    description:
      '<p>Join us to build next-generation web applications across the full stack.</p>',
    postedDaysAgo: 10,
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudNative',
    location: 'Poznan',
    workMode: 'onsite',
    salaryMin: 16000,
    salaryMax: 25000,
    technologies: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD'],
    level: 'mid',
    description:
      '<p>We need a <strong>DevOps Engineer</strong> to manage cloud infrastructure and CI/CD pipelines.</p>',
    postedDaysAgo: 3,
  },
  {
    title: 'UI/UX Designer & Frontend Developer',
    company: 'Creative Agency',
    location: 'Lodz',
    workMode: 'hybrid',
    salaryMin: 9000,
    salaryMax: 14000,
    technologies: ['Figma', 'React', 'CSS', 'JavaScript', 'Storybook'],
    level: 'mid',
    description:
      '<p>Looking for a creative <strong>UI/UX Designer &amp; Frontend Developer</strong> who bridges design and code.</p>',
    postedDaysAgo: 7,
  },
  {
    title: 'Mobile Developer (React Native)',
    company: 'AppWorks',
    location: 'Warsaw',
    workMode: 'remote',
    salaryMin: 13000,
    salaryMax: 19000,
    technologies: ['React Native', 'TypeScript', 'Redux', 'GraphQL'],
    level: 'mid',
    description:
      '<p>Build cross-platform mobile apps with <strong>React Native</strong> and a modern toolchain.</p>',
    postedDaysAgo: 1,
  },
  {
    title: 'Data Engineer',
    company: 'DataPulse',
    location: 'Krakow',
    workMode: 'hybrid',
    salaryMin: 17000,
    salaryMax: 24000,
    technologies: ['Python', 'Spark', 'Airflow', 'Snowflake', 'SQL'],
    level: 'senior',
    description:
      '<p>Design and maintain data pipelines powering analytics across the company.</p>',
    postedDaysAgo: 6,
  },
  {
    title: 'QA Automation Engineer',
    company: 'QualityFirst',
    location: 'Wroclaw',
    workMode: 'onsite',
    salaryMin: 10000,
    salaryMax: 15000,
    technologies: ['Playwright', 'TypeScript', 'Cypress', 'CI/CD'],
    level: 'mid',
    description:
      '<p>Own the automated testing strategy for our web products using Playwright.</p>',
    postedDaysAgo: 4,
  },
  {
    title: 'Junior Python Developer',
    company: 'ScriptLab',
    location: 'Remote',
    workMode: 'remote',
    salaryMin: 7000,
    salaryMax: 10000,
    technologies: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    level: 'junior',
    description:
      '<p>Kickstart your career building backend services in Python and Django.</p>',
    postedDaysAgo: 2,
  },
  {
    title: 'Security Engineer',
    company: 'SecureEdge',
    location: 'Gdansk',
    workMode: 'onsite',
    salaryMin: 18000,
    salaryMax: 26000,
    technologies: ['Kubernetes', 'AWS', 'Go', 'Penetration Testing'],
    level: 'senior',
    description:
      '<p>Protect our infrastructure and applications from evolving threats.</p>',
    postedDaysAgo: 9,
  },
  {
    title: 'Product Designer',
    company: 'DesignHub',
    location: 'Poznan',
    workMode: 'hybrid',
    salaryMin: 11000,
    salaryMax: 16000,
    technologies: ['Figma', 'UX Research', 'Prototyping', 'Design Systems'],
    level: 'mid',
    description:
      '<p>Shape delightful product experiences from research to high-fidelity mockups.</p>',
    postedDaysAgo: 3,
  },
  {
    title: 'Cloud Solutions Architect',
    company: 'CloudNative',
    location: 'Warsaw',
    workMode: 'remote',
    salaryMin: 22000,
    salaryMax: 30000,
    technologies: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD'],
    level: 'senior',
    description:
      '<p>Design cloud architectures that scale, with a focus on AWS and IaC.</p>',
    postedDaysAgo: 8,
  },
  {
    title: 'Frontend Developer (Vue)',
    company: 'Pixelo',
    location: 'Lodz',
    workMode: 'remote',
    salaryMin: 11000,
    salaryMax: 16000,
    technologies: ['Vue.js', 'TypeScript', 'Vite', 'TailwindCSS'],
    level: 'mid',
    description:
      '<p>Work on a design-heavy product with Vue 3 and a modern build stack.</p>',
    postedDaysAgo: 1,
  },
  {
    title: 'Scrum Master',
    company: 'AgileWorks',
    location: 'Krakow',
    workMode: 'onsite',
    salaryMin: 15000,
    salaryMax: 20000,
    technologies: ['Agile', 'Scrum', 'Jira', 'Facilitation'],
    level: 'mid',
    description:
      '<p>Guide two delivery teams toward continuous improvement and on-time releases.</p>',
    postedDaysAgo: 12,
  },
  {
    title: 'Junior DevOps Engineer',
    company: 'StartupHub',
    location: 'Remote',
    workMode: 'hybrid',
    salaryMin: 8000,
    salaryMax: 12000,
    technologies: ['Docker', 'Linux', 'GitHub Actions', 'AWS'],
    level: 'junior',
    description:
      '<p>Support our platform team with CI/CD pipelines and cloud infrastructure.</p>',
    postedDaysAgo: 2,
  },
  {
    title: 'SRE (Site Reliability Engineer)',
    company: 'ReliableSystems',
    location: 'Gdansk',
    workMode: 'hybrid',
    salaryMin: 19000,
    salaryMax: 27000,
    technologies: ['Kubernetes', 'Prometheus', 'Grafana', 'Go'],
    level: 'senior',
    description:
      '<p>Keep our services reliable with observability, automation and on-call ownership.</p>',
    postedDaysAgo: 5,
  },
  {
    title: 'Java Backend Developer',
    company: 'EnterpriseSoft',
    location: 'Warsaw',
    workMode: 'onsite',
    salaryMin: 15000,
    salaryMax: 21000,
    technologies: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL'],
    level: 'mid',
    description:
      '<p>Develop robust microservices for enterprise clients using Java and Spring Boot.</p>',
    postedDaysAgo: 4,
  },
  {
    title: 'WordPress Developer',
    company: 'WebCraft',
    location: 'Remote',
    workMode: 'remote',
    salaryMin: 8000,
    salaryMax: 12000,
    technologies: ['WordPress', 'PHP', 'JavaScript', 'CSS'],
    level: 'junior',
    description:
      '<p>Build custom WordPress themes and plugins for our agency clients.</p>',
    postedDaysAgo: 6,
  },
  {
    title: 'Machine Learning Engineer',
    company: 'AIForge',
    location: 'Krakow',
    workMode: 'hybrid',
    salaryMin: 20000,
    salaryMax: 28000,
    technologies: ['Python', 'PyTorch', 'MLOps', 'Docker'],
    level: 'senior',
    description:
      '<p>Bring ML models to production with a focus on MLOps and scalability.</p>',
    postedDaysAgo: 3,
  },
  {
    title: 'Technical Writer',
    company: 'DocuFlow',
    location: 'Remote',
    workMode: 'remote',
    salaryMin: 9000,
    salaryMax: 13000,
    technologies: ['Markdown', 'Git', 'API Documentation', 'Docusaurus'],
    level: 'mid',
    description:
      '<p>Document APIs and developer tools with clarity and precision.</p>',
    postedDaysAgo: 7,
  },
  {
    title: 'Frontend Intern',
    company: 'TechCorp',
    location: 'Warsaw',
    workMode: 'onsite',
    salaryMin: 4000,
    salaryMax: 6000,
    technologies: ['HTML', 'CSS', 'JavaScript', 'Angular'],
    level: 'junior',
    description:
      '<p>Learn on the job building real features with the guidance of senior engineers.</p>',
    postedDaysAgo: 1,
  },
];

async function main() {
  await pool.query(CREATE_JOBS_TABLE);
  await pool.query('DELETE FROM jobs');

  for (const job of jobs) {
    await pool.query(
      `INSERT INTO jobs
        (title, company, company_logo, location, work_mode, salary_min, salary_max, currency, technologies, level, description, apply_url, posted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        job.title,
        job.company,
        null,
        job.location,
        job.workMode,
        job.salaryMin,
        job.salaryMax,
        'PLN',
        job.technologies,
        job.level,
        job.description,
        `https://example.com/apply/${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        new Date(Date.now() - job.postedDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
      ],
    );
  }

  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM jobs');
  console.log(`Seeded ${rows[0].count} jobs.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
