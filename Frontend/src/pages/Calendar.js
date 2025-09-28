import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { api } from "../utils/api";
import { useFlashMessage } from "../contexts/FlashMessageContext";
import { Plus, Edit3, Trash2, Clock } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

// Custom styles for bookmark indicators
const calendarStyles = `
  .rbc-date-cell {
    position: relative;
  }
  .rbc-month-view .rbc-date-cell {
    position: relative;
    height: 40px;
  }
  .bookmark-indicator {
    position: absolute;
    top: 2px;
    right: 2px;
    z-index: 10;
  }
`;

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const { addSuccess, addError } = useFlashMessage();

  useEffect(() => {
    fetchPosts();
  }, []);

  // Create a map of dates to posts for quick lookup
  const getPostsForDate = (date) => {
    const dateStr = moment(date).format("YYYY-MM-DD");
    return events.filter(
      (event) => moment(event.start).format("YYYY-MM-DD") === dateStr
    );
  };

  const fetchPosts = async () => {
    try {
      const response = await api.getPosts();
      const postsData = response.data;

      // Convert posts to calendar events
      const calendarEvents = postsData
        .filter((post) => post.scheduledAt)
        .map((post) => ({
          id: post.id,
          title:
            post.content.length > 50
              ? post.content.substring(0, 50) + "..."
              : post.content,
          start: new Date(post.scheduledAt),
          end: new Date(post.scheduledAt),
          resource: post,
          allDay: false,
        }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setShowCreateModal(true);
  };

  const eventStyleGetter = (event) => {
    const post = event.resource;
    let backgroundColor = "#3174ad";

    switch (post.status) {
      case "published":
        backgroundColor = "#10b981";
        break;
      case "scheduled":
        backgroundColor = "#3b82f6";
        break;
      case "pending":
        backgroundColor = "#f59e0b";
        break;
      case "failed":
        backgroundColor = "#ef4444";
        break;
      default:
        backgroundColor = "#6b7280";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  // Custom date cell component to show bookmark indicators
  const CustomDateCell = ({ date, view }) => {
    if (view !== "month") return null;

    const postsForDate = getPostsForDate(date);
    if (postsForDate.length === 0) return null;

    // Group posts by platform and status
    const postsByStatus = postsForDate.reduce((acc, event) => {
      const status = event.resource.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const getStatusColor = (status) => {
      switch (status) {
        case "published":
          return "bg-green-500";
        case "scheduled":
          return "bg-blue-500";
        case "pending":
          return "bg-yellow-500";
        case "failed":
          return "bg-red-500";
        default:
          return "bg-gray-500";
      }
    };

    return (
      <div className="bookmark-indicator flex flex-wrap gap-1">
        {Object.entries(postsByStatus).map(([status, count]) => (
          <div
            key={status}
            className={`w-3 h-3 rounded-full ${getStatusColor(
              status
            )} flex items-center justify-center border border-white shadow-sm`}
            title={`${count} ${status} post${count > 1 ? "s" : ""}`}
          >
            {count > 1 && (
              <span
                className="text-xs text-white font-bold"
                style={{ fontSize: "8px", lineHeight: "1" }}
              >
                {count}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const EventModal = () => {
    if (!selectedEvent) return null;

    const post = selectedEvent.resource;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Post Details
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {post.content}
                </p>
              </div>

              {post.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image
                  </label>
                  <div className="mt-1">
                    <img
                      src={post.imageUrl}
                      alt="Scheduled content media"
                      className="max-w-full h-32 object-cover rounded-md border"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <p
                      className="text-xs text-gray-500 mt-1"
                      style={{ display: "none" }}
                    >
                      Image failed to load: {post.imageUrl}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Scheduled Time
                </label>
                <div className="mt-1 flex items-center text-sm text-gray-900">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  {moment(post.scheduledAt).format("MMMM D, YYYY [at] h:mm A")}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <span
                  className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.status === "published"
                      ? "bg-green-100 text-green-800"
                      : post.status === "scheduled"
                      ? "bg-blue-100 text-blue-800"
                      : post.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
              </div>

              {post.platforms && post.platforms.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Platforms
                  </label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {post.platforms.map((platform, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                type="button"
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreatePostModal = () => {
    const [formData, setFormData] = useState({
      content: "",
      imageUrl: "",
      imageFile: null,
      scheduledAt: selectedDate
        ? moment(selectedDate).format("YYYY-MM-DDTHH:mm")
        : "",
      platforms: ["twitter"],
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle image file selection
    const handleImageFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          addError("Please select a valid image file");
          return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          addError("Image file must be less than 10MB");
          return;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setFormData({ ...formData, imageFile: file, imageUrl: "" });
      }
    };

    // Upload image file to backend
    const uploadImageFile = async (file) => {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      try {
        const response = await api.post("/posts/upload-image", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data.imageUrl;
      } catch (error) {
        console.error("Image upload failed:", error);
        throw new Error("Failed to upload image");
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        let finalImageUrl = formData.imageUrl;

        // Upload file if user selected a file
        if (formData.imageFile) {
          try {
            finalImageUrl = await uploadImageFile(formData.imageFile);
          } catch (uploadError) {
            addError("Failed to upload image. Please try again.");
            setIsSubmitting(false);
            return;
          }
        }

        const response = await api.createPost({
          ...formData,
          imageUrl: finalImageUrl,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
        });

        // Show success flash message with scheduled time
        const scheduledTime =
          response.data?.scheduledTime ||
          moment(formData.scheduledAt).format("MMMM D, YYYY [at] h:mm A");

        addSuccess(`Post successfully scheduled for ${scheduledTime}`);

        setShowCreateModal(false);
        fetchPosts(); // Refresh calendar
      } catch (error) {
        console.error("Error creating post:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Unknown error occurred";
        addError(`Error scheduling post: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handlePostNow = async () => {
      if (!formData.content.trim()) {
        addError("Please enter content for your post");
        return;
      }

      setIsSubmitting(true);

      try {
        let finalImageUrl = formData.imageUrl;

        // Upload file if user selected a file
        if (formData.imageFile) {
          try {
            finalImageUrl = await uploadImageFile(formData.imageFile);
          } catch (uploadError) {
            addError("Failed to upload image. Please try again.");
            setIsSubmitting(false);
            return;
          }
        }

        const response = await api.post("/posts/post-now", {
          content: formData.content,
          imageUrl: finalImageUrl,
          platforms: formData.platforms,
        });

        console.log("Post now response:", response.data);
        addSuccess("Post published successfully!");
        setShowCreateModal(false);
        fetchPosts(); // Refresh calendar
      } catch (error) {
        console.error("Error posting now:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Unknown error occurred";
        addError(`Error posting immediately: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Schedule New Post
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What's on your mind?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image for Post
                </label>

                {/* Image Upload Section */}
                <div className="space-y-3">
                  {/* File Upload */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Upload Image File
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Or Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          imageUrl: e.target.value,
                          imageFile: null,
                        });
                        setImagePreview(e.target.value);
                      }}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Preview
                      </label>
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Upload preview"
                          className="max-w-full h-32 object-cover rounded-md border"
                          onError={() => {
                            setImagePreview(null);
                            if (formData.imageFile) {
                              setFormData({ ...formData, imageFile: null });
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({
                              ...formData,
                              imageUrl: "",
                              imageFile: null,
                            });
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  📷 For Instagram: Image is required
                  <br />
                  🐦 For Twitter: Image is optional
                  <br />
                  💡 Recommended: JPG/PNG, max 10MB, min 320x320px
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Scheduled Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledAt: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Platforms
                </label>
                <div className="mt-2 space-y-2">
                  {["twitter", "instagram"].map((platform) => (
                    <label
                      key={platform}
                      className="inline-flex items-center mr-4"
                    >
                      <input
                        type="checkbox"
                        value={platform}
                        checked={formData.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              platforms: [...formData.platforms, platform],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              platforms: formData.platforms.filter(
                                (p) => p !== platform
                              ),
                            });
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {platform}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePostNow}
                  disabled={isSubmitting}
                  className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post Now"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom styles */}
      <style>{calendarStyles}</style>

      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                Content Calendar
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Schedule and manage your social media posts
              </p>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="h-96 lg:h-[600px]">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              views={["month", "week", "day"]}
              defaultView="month"
              popup
              components={{
                event: ({ event }) => (
                  <div className="text-xs p-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs opacity-75">
                      {moment(event.start).format("h:mm A")}
                    </div>
                  </div>
                ),
                month: {
                  dateHeader: ({ date, label }) => (
                    <div className="relative">
                      <span>{label}</span>
                      <CustomDateCell date={date} view="month" />
                    </div>
                  ),
                },
              }}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Legend</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Post Status
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Published</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Scheduled</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Pending</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Failed</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Calendar Indicators
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow-sm mr-2"></div>
                  <span className="text-sm text-gray-700">
                    Scheduled posts (bookmark indicators on dates)
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center border border-white shadow-sm mr-2">
                    <span
                      className="text-xs text-white font-bold"
                      style={{ fontSize: "8px" }}
                    >
                      2
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">
                    Multiple posts on same day
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEventModal && <EventModal />}
      {showCreateModal && <CreatePostModal />}
    </div>
  );
};

export default Calendar;
