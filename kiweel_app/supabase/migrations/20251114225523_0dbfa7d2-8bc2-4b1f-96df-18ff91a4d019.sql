-- Clean database for QA testing
-- Delete in correct order to respect foreign keys

-- Delete all post interactions
DELETE FROM post_interactions;

-- Delete all professional posts
DELETE FROM professional_posts;

-- Delete all portfolio images
DELETE FROM portfolio_images;

-- Delete all services
DELETE FROM services;

-- Delete all reviews
DELETE FROM reviews;

-- Delete all bookings
DELETE FROM bookings;

-- Delete all messages
DELETE FROM messages;

-- Delete all subscriptions
DELETE FROM subscriptions;

-- Delete all user roles
DELETE FROM user_roles;

-- Delete all professionals
DELETE FROM professionals;

-- Delete all users
DELETE FROM users;
