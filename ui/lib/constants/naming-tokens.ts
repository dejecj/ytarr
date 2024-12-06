export const NAMING_TOKENS = {
  channel: {
    "{ChannelTitle}": "Channel name as displayed on YouTube",
    "{ChannelTitleClean}": "Channel name with special characters removed",
    "{ChannelId}": "Unique YouTube channel identifier",
    "{ChannelHandle}": "YouTube channel handle (without @)",
  },
  video: {
    "{VideoTitle}": "Full video title",
    "{VideoTitleClean}": "Video title with special characters removed",
    "{VideoId}": "YouTube video identifier",
    "{UploadDate}": "Video upload date (YYYY-MM-DD)",
    "{Duration}": "Video duration",
    "{Quality}": "Video quality (e.g., 1080p, 720p)",
    "{Format}": "Video format (e.g., mp4, webm)",
  },
  playlist: {
    "{PlaylistTitle}": "Playlist name",
    "{PlaylistId}": "Playlist identifier",
    "{PlaylistIndex}": "Video position in playlist",
  },
  metadata: {
    "{Category}": "Video category",
    "{Language}": "Video language",
    "{ViewCount}": "View count at time of download",
    "{LikeCount}": "Like count at time of download",
  }
}

export const NAMING_TEMPLATES = [
  {
    name: "Standard",
    format: "{ChannelTitle} - {UploadDate} - {VideoTitle} [{Quality}]",
    example: "TechChannel - 2024-12-03 - Amazing Video Title [1080p]"
  },
  {
    name: "Organized",
    format: "{ChannelTitle}/{VideoTitle} ({VideoId}) [{Quality}]",
    example: "TechChannel/Amazing Video Title (dQw4w9WgXcQ) [1080p]"
  },
  {
    name: "Playlist",
    format: "{ChannelTitle}/{PlaylistTitle}/{PlaylistIndex}. {VideoTitle}",
    example: "TechChannel/Best Videos/01. Amazing Video Title"
  }
]

export const COLON_REPLACEMENT_OPTIONS = [
  { value: "smart", label: "Smart Replace", description: "Automatically choose based on context" },
  { value: "delete", label: "Delete", description: "Remove colons entirely" },
  { value: "dash", label: "Replace with Dash", description: "Replace colons with -" },
  { value: "spaceDash", label: "Replace with Space Dash", description: "Replace colons with ' -'" },
  { value: "spaceDashSpace", label: "Replace with Space Dash Space", description: "Replace colons with ' - '" },
  { value: "custom", label: "Custom", description: "Use custom replacement character" }
]

