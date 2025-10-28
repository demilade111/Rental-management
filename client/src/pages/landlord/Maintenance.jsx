import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore"; // added import
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersVertical,
  Plus,
  Trash2,
  Reply,
  CheckCircle2,
  X,
  Eye,
  Upload,
} from "lucide-react";

function Maintenance() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    listingId: "",
    category: "",
    priority: "",
    date: "",
    description: "",
    image: null,
  });

  const [properties, setProperties] = useState([]);

  const token = useAuthStore((state) => state.token); // getting token from auth store

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/listings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch properties");

        const data = await res.json();
        console.log("Fetched properties:", data);
        setProperties(data.listings || data); 
        setProperties(Array.isArray(data) ? data : data.listings || []);
      } catch (err) {
        console.error("Error fetching properties:", err);
      }
    };

    fetchProperties();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/maintenance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            listingId: formData.listingId,
            priority: formData.priority,
            category: formData.category,
            date: formData.date,
            description: formData.description,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.message || "Failed to create request");
      }

      alert("Maintenance request created successfully!");
      setShowModal(false);
      setFormData({
        title: "",
        listingId: "",
        priority: "",
        category: "",
        date: "",
        description: "",
        image: null,
      });
    } catch (error) {
      console.error(error);
      alert(`Error submitting request: ${error.message}`);
    }
  };

  const columns = [
    { title: "Requests", actions: ["Cancel", "Accept"] },
    { title: "In Progress", actions: ["Reply", "Finish"] },
    { title: "Resolved", actions: ["Trash", "View"] },
  ];

  const sampleCards = Array.from({ length: 3 });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <h1 className="text-2xl font-bold">Maintenance</h1>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border rounded-md px-3 h-12 w-90">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="border-0 focus-visible:ring-0 h-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-12 flex items-center justify-center"
          >
            <SlidersVertical className="size-4 mr-2" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            Urgent <X className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            Property Title <X className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            Requests in 30 days <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <Button
        size="sm"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2"
      >
        <Plus className="size-4" /> New Request
      </Button>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.title} className="space-y-4">
            <h2 className="font-semibold text-lg">{col.title}</h2>
            {sampleCards.map((_, idx) => (
              <Card key={idx}>
                <CardHeader className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-muted rounded-md" />
                  <div>
                    <CardTitle>Title of the property</CardTitle>
                    <CardDescription>Short address</CardDescription>
                    <p className="text-xs text-muted-foreground mt-1">
                      Request date · Urgency
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">
                    Short description of maintenance request.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {col.actions.map((action) => (
                    <Button
                      key={action}
                      variant={
                        action === "Cancel" || action === "Trash"
                          ? "outline"
                          : "default"
                      }
                      size="sm"
                    >
                      {action === "Cancel" && <X className="size-4 mr-1" />}
                      {action === "Accept" && (
                        <CheckCircle2 className="size-4 mr-1" />
                      )}
                      {action === "Reply" && <Reply className="size-4 mr-1" />}
                      {action === "Finish" && (
                        <CheckCircle2 className="size-4 mr-1" />
                      )}
                      {action === "Trash" && <Trash2 className="size-4 mr-1" />}
                      {action === "View" && <Eye className="size-4 mr-1" />}
                      {action}
                    </Button>
                  ))}
                </CardFooter>
              </Card>
            ))}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              New Maintenance Request
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. My door is broken"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Property</label>
                  <select
                    name="listingId"
                    value={formData.listingId}
                    onChange={handleChange}
                    className="border rounded-md w-full p-2"
                    required
                  >
                    <option value="">Select property</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title || property.name || "Untitled Property"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="border rounded-md w-full p-2"
                    required
                  >
                    <option value="">Select priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Normal</option>
                    <option value="HIGH">Important</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="border rounded-md w-full p-2"
                  required
                >
                  <option value="">Select category</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="HVAC">HVAC</option>
                  <option value="APPLIANCE">Appliance</option>
                  <option value="STRUCTURAL">Structural</option>
                  <option value="PEST_CONTROL">Pest Control</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="LANDSCAPING">Landscaping</option>
                  <option value="SECURITY">Security</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Date</label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="border rounded-md w-full p-2"
                  placeholder="Describe the issue..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium">Image</label>
                <label className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-muted/10">
                  <Upload className="size-6 mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Upload image
                  </span>
                  <input
                    type="file"
                    name="image"
                    className="hidden"
                    onChange={handleChange}
                    accept="image/*"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maintenance;
