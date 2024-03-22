import { Contribution } from 'src/contributions/entities/contribution.entity';

export const mapContributions = (contributions: Contribution[]) =>
  contributions.map((contribution) => {
    if (contribution.is_anonymous) {
      delete contribution.student;
    }

    return contribution;
  });
