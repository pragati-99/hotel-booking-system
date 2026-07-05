// src/components/Blog.jsx
import React from 'react';
import "../../styles/blog.css";
import blogImg1 from "../../assets/images/blog-1.jpg";
import blogImg2 from "../../assets/images/blog-11.jpg";
import blogImg3 from "../../assets/images/blog-9.jpg";

function Blog() {
  const blogs = [
    {
      image: blogImg1,
      title: "Luxury Hotel Experience",
      description: "Discover the ultimate luxury stay with breathtaking views, world-class amenities, and personalized service that makes every moment memorable."
    },
    {
      image: blogImg2,
      title: "Best Vacation Rooms",
      description: "Explore our premium rooms designed for comfort and elegance. Each room offers stunning views and modern amenities for a perfect vacation."
    },
    {
      image: blogImg3,
      title: "Travel & Relaxation Tips",
      description: "Plan your perfect getaway with our expert travel tips. From best destinations to relaxation techniques, make your stay truly unforgettable."
    }
  ];

  return (
    <section className="blog-section">
      <div className="container">
        <div className="blog-title">
          <span>LATEST NEWS</span>
          <h2>From Our Blog</h2>
        </div>

        <div className="blog-grid">
          {blogs.map((blog, index) => (
            <div className="blog-card" key={index}>
              <img src={blog.image} alt={blog.title} />
              <div className="blog-content">
                <h4>{blog.title}</h4>
                <p>{blog.description}</p>
                <button>READ MORE</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Blog;