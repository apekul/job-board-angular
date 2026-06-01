import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Job, JobsQueryParams } from '../models/job.model';

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    companyLogo: undefined,
    location: 'Warsaw',
    remote: true,
    salaryMin: 12000,
    salaryMax: 18000,
    currency: 'PLN',
    technologies: ['Angular', 'TypeScript', 'TailwindCSS', 'RxJS'],
    level: 'mid',
    description: `<p>We are looking for a skilled <strong>Frontend Developer</strong> to join our growing team.</p>
<p>You will be responsible for building and maintaining high-quality web applications using Angular and TypeScript.</p>
<h3>Requirements</h3>
<ul>
  <li>3+ years of experience with Angular</li>
  <li>Strong TypeScript skills</li>
  <li>Experience with TailwindCSS or similar utility-first CSS frameworks</li>
  <li>Familiarity with REST APIs and HTTP clients</li>
</ul>
<h3>Nice to have</h3>
<ul>
  <li>Experience with SSR (Angular Universal)</li>
  <li>Knowledge of testing frameworks (Jest, Cypress)</li>
</ul>`,
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/1',
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: 'DataSystems',
    companyLogo: undefined,
    location: 'Krakow',
    remote: false,
    salaryMin: 15000,
    salaryMax: 22000,
    currency: 'PLN',
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'TypeScript', 'Docker'],
    level: 'senior',
    description: `<p>We are hiring a <strong>Backend Engineer</strong> to design and build scalable APIs.</p>
<p>You will work closely with our product team to deliver robust backend solutions.</p>
<h3>Requirements</h3>
<ul>
  <li>5+ years of backend development experience</li>
  <li>Strong knowledge of Node.js and Express</li>
  <li>Experience with PostgreSQL and database design</li>
  <li>Familiarity with Docker and container orchestration</li>
</ul>`,
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/2',
  },
  {
    id: '3',
    title: 'Junior React Developer',
    company: 'StartupHub',
    companyLogo: undefined,
    location: 'Wroclaw',
    remote: true,
    salaryMin: 6000,
    salaryMax: 9000,
    currency: 'PLN',
    technologies: ['React', 'JavaScript', 'CSS', 'Git'],
    level: 'junior',
    description: `<p>Great opportunity for a <strong>Junior React Developer</strong> to kickstart their career!</p>
<p>You will work in a fast-paced startup environment with experienced mentors.</p>
<h3>Requirements</h3>
<ul>
  <li>Basic knowledge of React and JavaScript</li>
  <li>Understanding of HTML and CSS</li>
  <li>Eagerness to learn and grow</li>
</ul>`,
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/3',
  },
  {
    id: '4',
    title: 'Full Stack Developer',
    company: 'Innovate Solutions',
    companyLogo: undefined,
    location: 'Gdansk',
    remote: true,
    salaryMin: 14000,
    salaryMax: 20000,
    currency: 'PLN',
    technologies: ['Vue.js', 'Node.js', 'MongoDB', 'GraphQL', 'AWS'],
    level: 'senior',
    description: `<p>Join our team as a <strong>Full Stack Developer</strong> and help us build next-generation web applications.</p>
<h3>Requirements</h3>
<ul>
  <li>5+ years of full stack development experience</li>
  <li>Proficiency in Vue.js and Node.js</li>
  <li>Experience with MongoDB and GraphQL</li>
  <li>AWS cloud services knowledge</li>
</ul>`,
    postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/4',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudNative',
    companyLogo: undefined,
    location: 'Poznan',
    remote: false,
    salaryMin: 16000,
    salaryMax: 25000,
    currency: 'PLN',
    technologies: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD'],
    level: 'mid',
    description: `<p>We need a <strong>DevOps Engineer</strong> to manage our cloud infrastructure and CI/CD pipelines.</p>
<h3>Requirements</h3>
<ul>
  <li>3+ years of DevOps experience</li>
  <li>Strong knowledge of Kubernetes and Docker</li>
  <li>Experience with Infrastructure as Code (Terraform)</li>
  <li>AWS certification preferred</li>
</ul>`,
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/5',
  },
  {
    id: '6',
    title: 'UI/UX Designer & Frontend Developer',
    company: 'Creative Agency',
    companyLogo: undefined,
    location: 'Lodz',
    remote: true,
    salaryMin: 9000,
    salaryMax: 14000,
    currency: 'PLN',
    technologies: ['Figma', 'React', 'CSS', 'JavaScript', 'Storybook'],
    level: 'mid',
    description: `<p>Looking for a creative <strong>UI/UX Designer & Frontend Developer</strong> who bridges design and code.</p>
<h3>Requirements</h3>
<ul>
  <li>Experience with Figma and design systems</li>
  <li>Frontend development skills in React</li>
  <li>Strong eye for detail and aesthetics</li>
  <li>Portfolio demonstrating UI/UX work</li>
</ul>`,
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://example.com/apply/6',
  },
];

export const ALL_TECHNOLOGIES = [...new Set(MOCK_JOBS.flatMap((j) => j.technologies))].sort();

@Injectable({ providedIn: 'root' })
export class JobsService {
  getJobs(params?: JobsQueryParams): Observable<Job[]> {
    let result = [...MOCK_JOBS];

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.technologies.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (params?.location) {
      const loc = params.location.toLowerCase();
      result = result.filter((j) => j.location.toLowerCase().includes(loc));
    }

    if (params?.remote !== undefined) {
      result = result.filter((j) => j.remote === params.remote);
    }

    if (params?.salaryMin !== undefined) {
      result = result.filter((j) => j.salaryMax >= params.salaryMin!);
    }

    if (params?.salaryMax !== undefined) {
      result = result.filter((j) => j.salaryMin <= params.salaryMax!);
    }

    if (params?.technologies?.length) {
      result = result.filter((j) =>
        params.technologies!.some((t) => j.technologies.includes(t)),
      );
    }

    if (params?.level?.length) {
      result = result.filter((j) => params.level!.includes(j.level));
    }

    if (params?.sort === 'salary_asc') {
      result.sort((a, b) => a.salaryMin - b.salaryMin);
    } else if (params?.sort === 'salary_desc') {
      result.sort((a, b) => b.salaryMin - a.salaryMin);
    } else {
      result.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }

    return of(result);
  }

  getJobById(id: string): Observable<Job | undefined> {
    return of(MOCK_JOBS.find((j) => j.id === id));
  }
}
