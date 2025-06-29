// courses.js
const courses = [
  {
    title: "React Fundamentals",
    description: "Learn the core concepts of React including components, state, props, and hooks.",
    category: "Web Development",
    instructor: "Jane Doe",
    instructorAvatar: "https://example.com/avatars/jane-doe.png",
    image: "https://example.com/images/react-course.png",
    level: "Beginner",
    price: 49.99,
    totalTimeLimit: 360,
    rating: 4.5,
    authorId:1
  },
  {
    title: "Advanced Next.js",
    description: "Master server-side rendering, API routes, and App Router in Next.js.",
    category: "Web Development",
    instructor: "John Smith",
    instructorAvatar: "https://example.com/avatars/john-smith.png",
    image: "https://example.com/images/nextjs-course.png",
    level: "Advanced",
    price: 79.99,
    totalTimeLimit: 480,
    rating: 4.8,
    authorId:1
  },
  {
    title: "Modern JavaScript ES6+",
    description: "Deep dive into JavaScript ES6+ features including async/await, destructuring, and modules.",
    category: "Web Development",
    instructor: "Emily Johnson",
    instructorAvatar: "https://example.com/avatars/emily-johnson.png",
    image: "https://example.com/images/js-course.png",
    level: "Intermediate",
    price: 39.99,
    totalTimeLimit: 300,
    rating: 4.6,
    authorId:1
  },
  {
    title: "UI Design with Figma",
    description: "Create beautiful and responsive user interfaces using Figma tools and best practices.",
    category: "UI/UX Design",
    instructor: "Alex Grey",
    instructorAvatar: "https://example.com/avatars/alex-grey.png",
    image: "https://example.com/images/figma-course.png",
    level: "Beginner",
    price: 45.00,
    totalTimeLimit: 240,
    rating: 4.4,
    authorId:1
  },
  {
    title: "UX Research & Prototyping",
    description: "Understand user research methods and build effective prototypes that resonate with your audience.",
    category: "UI/UX Design",
    instructor: "Nina Patel",
    instructorAvatar: "https://example.com/avatars/nina-patel.png",
    image: "https://example.com/images/ux-course.png",
    level: "Intermediate",
    price: 60.00,
    totalTimeLimit: 360,
    rating: 4.7,
    authorId:1
  },
  {
    title: "Design Systems & Accessibility",
    description: "Build scalable design systems and ensure inclusive user experiences with accessibility standards.",
    category: "UI/UX Design",
    instructor: "Michael Lee",
    instructorAvatar: "https://example.com/avatars/michael-lee.png",
    image: "https://example.com/images/design-systems-course.png",
    level: "Advanced",
    price: 75.00,
    totalTimeLimit: 420,
    rating: 4.9,
    authorId:1
  },
  {
    title: "SQL for Beginners",
    description: "Learn how to write queries, join tables, and manage databases with SQL.",
    category: "Database",
    instructor: "Rachel Green",
    instructorAvatar: "https://example.com/avatars/rachel-green.png",
    image: "https://example.com/images/sql-course.png",
    level: "Beginner",
    price: 35.00,
    totalTimeLimit: 300,
    rating: 4.3,
    authorId:1
  },
  {
    title: "MongoDB Essentials",
    description: "Master MongoDB CRUD operations, data modeling, and indexing in NoSQL databases.",
    category: "Database",
    instructor: "Daniel Kim",
    instructorAvatar: "https://example.com/avatars/daniel-kim.png",
    image: "https://example.com/images/mongodb-course.png",
    level: "Intermediate",
    price: 55.00,
    totalTimeLimit: 360,
    rating: 4.6,
    authorId:1
  },
  {
    title: "PostgreSQL Performance Tuning",
    description: "Optimize your PostgreSQL databases with indexes, query planning, and vacuuming techniques.",
    category: "Database",
    instructor: "Sophia Rao",
    instructorAvatar: "https://example.com/avatars/sophia-rao.png",
    image: "https://example.com/images/postgres-course.png",
    level: "Advanced",
    price: 80.00,
    totalTimeLimit: 420,
    rating: 4.8,
    authorId:1
  },
  {
    title: "Data Science with Python",
    description: "Learn to analyze, visualize, and model data using Python libraries like Pandas, NumPy, and Matplotlib.",
    category: "Data Science",
    instructor: "Dr. Priya Nair",
    instructorAvatar: "https://example.com/avatars/priya-nair.png",
    image: "https://example.com/images/data-science-python.png",
    level: "Intermediate",
    price: 69.99,
    totalTimeLimit: 480,
    rating: 4.7,
    authorId:1
  },
  {
    title: "Introduction to Machine Learning",
    description: "Understand supervised and unsupervised learning, model training, and evaluation using scikit-learn.",
    category: "Machine Learning",
    instructor: "Ankit Sharma",
    instructorAvatar: "https://example.com/avatars/ankit-sharma.png",
    image: "https://example.com/images/ml-intro.png",
    level: "Beginner",
    price: 59.99,
    totalTimeLimit: 450,
    rating: 4.5,
    authorId:1
  },
  {
    title: "Digital Marketing Strategy",
    description: "Learn SEO, social media, email marketing, and ad strategy to grow your brand online.",
    category: "Digital Marketing",
    instructor: "Sara Malik",
    instructorAvatar: "https://example.com/avatars/sara-malik.png",
    image: "https://example.com/images/digital-marketing.png",
    level: "Beginner",
    price: 42.00,
    totalTimeLimit: 360,
    rating: 4.6,
    authorId:1
  }
];

const apiURL = "http://localhost:3000/api/courses";

(async () => {
  for (const course of courses) {
    try {
      const res = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(course)
      });

      const result = await res.json();
      console.log(`✅ Created: ${course.title}`, result);
    } catch (err) {
      console.error(`❌ Failed: ${course.title}`, err);
    }
  }
})();

