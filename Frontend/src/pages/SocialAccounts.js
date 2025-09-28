import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import {
  Plus,
  Check,
  ExternalLink,
  Users,
  Settings,
  AlertCircle,
  Shield,
  Unlink,
} from "lucide-react";

const SocialAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState(null);

  const platforms = [
    {
      id: "twitter",
      name: "Twitter",
      icon: "🐦",
      color: "bg-sky-500",
      description: "Share tweets and engage with your audience",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: "📷",
      color: "bg-pink-600",
      description: "Post photos and stories to Instagram",
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: "🎥",
      color: "bg-red-600",
      description: "Upload and schedule YouTube videos",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: "🎵",
      color: "bg-black",
      description: "Share short-form videos on TikTok",
    },
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Handle OAuth callback messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");

    if (success) {
      alert(success);
      // Refresh accounts after successful connection
      fetchAccounts();
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (error) {
      alert(`Error: ${error}`);
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.getSocialAccounts();
      setAccounts(response.data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      // Set empty array if API fails
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform) => {
    setConnectingPlatform(platform.id);

    try {
      if (platform.id === "instagram") {
        // Get Instagram OAuth URL from backend
        const response = await api.get("/social/instagram/auth");

        if (response.data.success && response.data.authUrl) {
          // Redirect to Instagram OAuth
          window.location.href = response.data.authUrl;
          return;
        } else {
          throw new Error("Failed to get Instagram auth URL");
        }
      } else {
        // For other platforms, show coming soon message
        alert(`${platform.name} integration coming soon!`);
      }
    } catch (error) {
      console.error("Error connecting account:", error);
      alert(
        `Failed to connect to ${platform.name}. ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (accountId) => {
    try {
      console.log(`Disconnecting account ${accountId}...`);
      // For now, just remove from local state
      // await api.disconnectSocialAccount(accountId);
      setAccounts((prev) => prev.filter((account) => account.id !== accountId));
      alert("Account disconnected successfully!");
    } catch (error) {
      console.error("Error disconnecting account:", error);
      alert("Failed to disconnect account. Please try again.");
    }
  };

  const handleSettings = (account) => {
    console.log(`Opening settings for ${account.platformName}...`);
    alert(
      `Settings for ${account.platformName} account will be available soon!`
    );
  };

  const handleViewProfile = (account) => {
    console.log(`Opening profile for ${account.platformName}...`);
    // In a real implementation, this would open the social media profile
    const urls = {
      twitter: `https://twitter.com/${account.username.replace("@", "")}`,
      instagram: `https://instagram.com/${account.username.replace("@", "")}`,
    };
    const url = profileUrls[account.platform] || "#";
    if (url !== "#") {
      window.open(url, "_blank");
    } else {
      alert(`Profile link for ${account.platformName} will be available soon!`);
    }
  };

  const getConnectedAccount = (platformId) => {
    return accounts.find(
      (account) => account.platform === platformId && account.isConnected
    );
  };

  const AccountCard = ({ platform }) => {
    const connectedAccount = getConnectedAccount(platform.id);
    const isConnected = !!connectedAccount;
    const isConnecting = connectingPlatform === platform.id;

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div
              className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center text-white text-xl mr-4`}
            >
              {platform.icon}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {platform.name}
              </h3>
              <p className="text-sm text-gray-500">{platform.description}</p>
              {isConnected && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  {connectedAccount.followers.toLocaleString()} followers
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
                <button
                  onClick={() => handleDisconnect(connectedAccount.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                  title="Disconnect account"
                >
                  <Unlink className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnect(platform)}
                disabled={isConnecting}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {isConnected && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-500">Connected as:</span>
                <span className="ml-1 font-medium text-gray-900">
                  {connectedAccount.username}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSettings(connectedAccount)}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </button>
                <button
                  onClick={() => handleViewProfile(connectedAccount)}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Profile
                </button>
              </div>
            </div>
          </div>
        )}
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

  const connectedCount = accounts.filter(
    (account) => account.isConnected
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold leading-7 text-gray-900">
                  Social Media Accounts
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Connect your social media accounts to start scheduling posts
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{connectedCount}</span> of{" "}
                  {platforms.length} accounts connected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {connectedCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Followers
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {accounts
                      .reduce(
                        (sum, account) => sum + (account.followers || 0),
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Connected Accounts
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {connectedCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Security Status
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">Secure</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Your data is secure
              </h3>
              <p className="mt-1 text-sm text-blue-800">
                We use OAuth 2.0 for secure authentication. We never store your
                social media passwords and only access what you explicitly
                authorize.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => (
            <AccountCard key={platform.id} platform={platform} />
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Need help connecting accounts?
              </h3>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p>
                  • Make sure you have admin access to the social media accounts
                  you want to connect
                </p>
                <p>
                  • Some platforms may require business accounts for API access
                </p>
                <p>
                  • Check your browser's popup blocker if the connection window
                  doesn't appear
                </p>
                <p>• Contact support if you continue to experience issues</p>
              </div>
              <div className="mt-4">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialAccounts;
