import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // We navigate to SongList because we rebuilt the UI as an all-in-one
    // application, meaning the player is now natively embedded in the SongList page.
    navigate("/SongList");
  }, [navigate, id]);

  return null;
}

