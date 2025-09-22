import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import {
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    connectedAccounts: 0,
    pendingPosts: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [postsResponse, accountsResponse] = await Promise.all([
        api.getPosts(),
        api.getSocialAccounts(),
      ]);

      const posts = postsResponse.data;
      const accounts = accountsResponse.data;

      setStats({
        totalPosts: posts.length,
        scheduledPosts: posts.filter((p) => p.status === "scheduled").length,
        connectedAccounts: accounts.filter((a) => a.isConnected).length,
        pendingPosts: posts.filter((p) => p.status === "pending").length,
      });

      setRecentPosts(posts.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${color}`}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  );

  const PostStatus = ({ status }) => {
    const statusConfig = {
      published: {
        color: "text-green-600",
        icon: CheckCircle,
        bg: "bg-green-100",
      },
      scheduled: { color: "text-blue-600", icon: Clock, bg: "bg-blue-100" },
      pending: {
        color: "text-yellow-600",
        icon: AlertCircle,
        bg: "bg-yellow-100",
      },
      failed: { color: "text-red-600", icon: AlertCircle, bg: "bg-red-100" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
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
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <div>
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                      Welcome back, {user?.firstName || "User"}!
                    </h1>
                  </div>
                  <dl className="mt-6 flex flex-col sm:mt-1 sm:flex-row sm:flex-wrap">
                    <dt className="sr-only">Account status</dt>
                    <dd className="flex items-center text-sm text-gray-500 font-medium capitalize sm:mr-6">
                      <CheckCircle className="flex-shrink-0 mr-1.5 h-4 w-4 text-green-400" />
                      Account Active
                    </dd>
                    <dt className="sr-only">Last login</dt>
                    <dd className="mt-3 flex items-center text-sm text-gray-500 font-medium sm:mr-6 sm:mt-0">
                      <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Last login today
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Posts"
              value={stats.totalPosts}
              icon={BarChart3}
              color="text-blue-600"
            />
            <StatCard
              title="Scheduled Posts"
              value={stats.scheduledPosts}
              icon={Clock}
              color="text-green-600"
            />
            <StatCard
              title="Connected Accounts"
              value={stats.connectedAccounts}
              icon={Users}
              color="text-purple-600"
            />
            <StatCard
              title="Pending Posts"
              value={stats.pendingPosts}
              icon={AlertCircle}
              color="text-yellow-600"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Posts
                </h3>
                {recentPosts.length > 0 ? (
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              {post.content}
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {post.scheduledAt
                                ? new Date(
                                    post.scheduledAt
                                  ).toLocaleDateString()
                                : "Not scheduled"}
                            </div>
                          </div>
                          <PostStatus status={post.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No posts yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating your first post.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Plus className="h-4 w-4 mr-3 text-gray-400" />
                    Create New Post
                  </button>
                  <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    Schedule Post
                  </button>
                  <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Users className="h-4 w-4 mr-3 text-gray-400" />
                    Connect Account
                  </button>
                  <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <MessageSquare className="h-4 w-4 mr-3 text-gray-400" />
                    AI Assistant
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Account Settings
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Settings className="h-4 w-4 mr-3 text-gray-400" />
                    Profile Settings
                  </button>
                  <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <BarChart3 className="h-4 w-4 mr-3 text-gray-400" />
                    Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
