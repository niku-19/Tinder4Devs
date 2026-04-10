export const validateCreateProfile = (request) => {
  const {
    fullName,
    designation,
    experience,
    intent,
    bio,
    github,
    portfolio,
    techStack,
    interests,
    galleryImages,
  } = request.body;

  if (
    !fullName ||
    !designation ||
    !experience ||
    !intent ||
    !bio ||
    !github ||
    !portfolio ||
    !techStack ||
    !interests ||
    !galleryImages
  ) {
    throw new Error('Required Field is missing');
  }

  console.log(interests);

  if (fullName.trim() === '') throw new Error('Full Name cannot be empty');
  if (designation.trim() === '') throw new Error('Designation cannot be empty');
  if (bio.trim() === '') throw new Error('Bio cannot be empty');
  if (github.trim() === '') throw new Error('Github cannot be empty');
  if (portfolio.trim() === '') throw new Error('Portfolio cannot be empty');
  if (techStack.length < 2)
    throw new Error('At least 3 tech stacks are required');
  if (interests.length < 0)
    throw new Error('At least 1 interests are required');
  if (galleryImages.length < 2)
    throw new Error('At least 2 images are required');

  if (experience === '') throw new Error('Experience cannot be empty');
  if (intent === '') throw new Error('Intent cannot be empty');
};
