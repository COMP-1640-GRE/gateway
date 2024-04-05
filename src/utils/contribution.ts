import { CrudRequest } from '@nestjsx/crud';
import { Contribution } from 'src/contributions/entities/contribution.entity';
import { ReactionType } from 'src/reactions/entities/reaction.entity';

export const mapContributions = (
  contributions: Contribution[],
  userId: number,
  sorts: CrudRequest['parsed']['sort'],
) => {
  const reactionType = Object.values(ReactionType);

  contributions = contributions.map((contribution) => {
    if (contribution.is_anonymous) {
      delete contribution.student;
    }
    const reaction = contribution.reactions.reduce(
      (acc, curr) => {
        if (curr.user.id === userId) {
          acc.reacted = curr.type;
        }

        reactionType.forEach((type) => {
          if (curr.type === type) {
            acc[type] = acc[type] + 1;
          }
        });

        return acc;
      },
      {
        like: 0,
        dislike: 0,
        reacted: null,
      },
    );

    contribution['reaction'] = reaction;
    contribution['comment_count'] = contribution.comments.length;

    return contribution;
  });

  sorts.forEach((sort) => {
    const { field, order } = sort;

    if (reactionType.includes(sort.field as ReactionType)) {
      contributions.sort(
        (a, b) =>
          (a['reaction'][field] - b['reaction'][field]) *
          (order === 'ASC' ? 1 : -1),
      );
    }
    if (sort.field === 'comment_count') {
      contributions.sort(
        (a, b) =>
          (a['comment_count'] - b['comment_count']) *
          (order === 'ASC' ? 1 : -1),
      );
    }
  });

  return contributions;
};
