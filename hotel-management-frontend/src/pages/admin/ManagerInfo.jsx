import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaUserTie } from "react-icons/fa";

function ManagerInfo() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await axios.get("/api/employees/managers");
      setManagers(response.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load managers");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="mb-4">Manager Information</h2>
      <div className="card">
        <div className="card-body">
          {managers.length === 0 ? (
            <div className="text-center py-4">
              <FaUserTie size={48} className="text-muted mb-3" />
              <p>No managers found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Salary</th>
                    <th>Hire Date</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((manager) => (
                    <tr key={manager.id}>
                      <td><strong>{manager.name}</strong></td>
                      <td>{manager.email}</td>
                      <td>{manager.phone}</td>
                      <td>{manager.department}</td>
                      <td>${manager.salary}</td>
                      <td>{manager.hireDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManagerInfo;