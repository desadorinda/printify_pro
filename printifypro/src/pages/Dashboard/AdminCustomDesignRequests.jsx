import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";
import "./AdminDashboard.css";

const AdminCustomDesignRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/custom-design-requests`,
          {
            headers: {
              Authorization: localStorage.getItem("token")
                ? `Bearer ${localStorage.getItem("token")}`
                : undefined,
            },
          }
        );
        const data = await res.json();
        if (res.ok) setRequests(data.requests || []);
        else setError(data.error || "Failed to load requests");
      } catch {
        setError("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="admin-section-content">
      <h3 className="admin-section-title">Custom Design Requests</h3>
      <div className="admin-table-wrapper">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : requests.length === 0 ? (
          <div>No custom design requests found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Product</th>
                <th>Description</th>
                <th>Reference Image</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.id}</td>
                  <td>{req.user_id || "Guest"}</td>
                  <td>{req.name}</td>
                  <td>{req.email}</td>
                  <td>{req.phone || ""}</td>
                  <td>{req.product}</td>
                  <td
                    style={{
                      maxWidth: 300,
                      whiteSpace: "pre-line",
                      wordBreak: "break-word",
                    }}
                  >
                    {req.description}
                  </td>
                  <td>
                    {req.reference_image ? (
                      <>
                        <a
                          href={
                            req.reference_image.startsWith("/uploads")
                              ? API_BASE_URL.replace(/\/api$/, "") +
                                req.reference_image
                              : req.reference_image
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                        <br />
                        <img
                          src={
                            req.reference_image.startsWith("/uploads")
                              ? API_BASE_URL.replace(/\/api$/, "") +
                                req.reference_image
                              : req.reference_image
                          }
                          alt="reference"
                          style={{
                            maxWidth: 80,
                            maxHeight: 80,
                            marginTop: 4,
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setPreviewImage(
                              req.reference_image.startsWith("/uploads")
                                ? API_BASE_URL.replace(/\/api$/, "") +
                                    req.reference_image
                                : req.reference_image
                            )
                          }
                        />
                      </>
                    ) : (
                      "None"
                    )}
                  </td>
                  <td>{new Date(req.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Large preview"
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                borderRadius: 10,
                boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
              }}
            />
            <button
              style={{
                marginTop: 16,
                padding: "8px 24px",
                borderRadius: 6,
                background: "#bfa14a",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
              }}
              onClick={() => setPreviewImage(null)}
            >
              Close
            </button>
          </div>
          <style>{`
            .modal-overlay {
              position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
              background: rgba(0,0,0,0.45); z-index: 2000; display: flex; align-items: center; justify-content: center;
            }
            .modal-content {
              background: #fffbe6; padding: 32px 32px 24px 32px; border-radius: 18px; box-shadow: 0 4px 32px rgba(191,161,74,0.13); display: flex; flex-direction: column; align-items: center;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default AdminCustomDesignRequests;
