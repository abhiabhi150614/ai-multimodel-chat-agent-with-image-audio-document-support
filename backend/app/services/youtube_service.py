
from youtube_transcript_api import YouTubeTranscriptApi
from app.core.logging import logger
import re

class YouTubeService:
    def extract_video_id(self, url: str) -> str:
        # Regex for standard YouTube URLs
        regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
        match = re.search(regex, url)
        return match.group(1) if match else ""

    def get_transcript(self, url: str) -> tuple[str, bool]:
        """
        Refetches transcript for a YouTube URL.
        Returns: (transcript_text, success)
        """
        video_id = self.extract_video_id(url)
        if not video_id:
            return "Invalid YouTube URL", False
            
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            full_text = " ".join([item['text'] for item in transcript_list])
            return full_text, True
        except Exception as e:
            logger.error(f"YouTube transcript failed: {e}")
            return "Transcript unavailable for this video.", False

youtube_service = YouTubeService()
