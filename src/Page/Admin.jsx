import { useState } from "react"
import axios from "axios"

function Admin() {
  const [title, setTitle] = useState("")
  const [image, setImage] = useState(null)
  const [durasi, setDurasi] = useState("")
  const [kategori, setKategori] = useState("")
  const [No_Studio, setStudio] = useState("")
  const [director, setDirector] = useState("")
  const [rating, setRating] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("title", title)
    formData.append("durasi", durasi)
    formData.append("kategori", kategori)
    formData.append("studio", No_Studio)
    formData.append("director", director)
    formData.append("rating", rating)
    formData.append("image", image)

    try {
      const res = await axios.post(
        "http://localhost/24SI1_PHP/upload.php",
        formData,
      )

      console.log(res.data)
      alert("Upload Success!")

      setTitle("")
      setImage(null)
      setDurasi("")
      setKategori("")
      setStudio("")

    } catch (err) {
      console.log(err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>

  <input
    type="text"
    placeholder="Judul Film"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />

  <input
    type="time"
    placeholder="Durasi (menit)"
    step="60"
    value={durasi}
    onChange={(e) => setDurasi(e.target.value)}
  />

<select value={kategori} onChange={(e) => setKategori(e.target.value)}>
  <option value="">Pilih Kategori</option>
  <option value="AKSI">Action</option>
  <option value="ANIM">Animation</option>
  <option value="DRAMA">Drama</option>
  <option value="HOROR">Horror</option>
  <option value="SCIFI">Science Fiction</option>
</select>

  <input
    type="number"
    placeholder="No Studio"
    value={No_Studio}
    onChange={(e) => setStudio(e.target.value)}
  />

  <input
    type="file"
    accept="image/png, image/jpeg"
    onChange={(e) => setImage(e.target.files[0])}
  />

<input
  type="text"
  placeholder="Director"
  value={director}
  onChange={(e) => setDirector(e.target.value)}
/>

<input
  type="number"
  step="0.1"
  placeholder="Rating (contoh: 8.5)"
  value={rating}
  onChange={(e) => setRating(e.target.value)}
/>

  <button type="submit">Upload</button>

</form>
  )
}

export default Admin;