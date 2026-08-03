import { Job } from './job.model';

export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface ApplicationEvent {
  status: ApplicationStatus;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  events: ApplicationEvent[];
  job: Job;
}
