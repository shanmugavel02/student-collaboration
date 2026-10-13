import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Profile.css";


function Profile() {

  const navigate = useNavigate();


  const [student, setStudent] = useState(null);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

  const [skills, setSkills] = useState("");

  const [bio, setBio] = useState("");

  const [editMode, setEditMode] = useState(false);

  const [message, setMessage] = useState("");


  // Get current student's email
  const email =
    localStorage.getItem("studentEmail");


  // =================================
  // LOAD PROFILE
  // =================================

  useEffect(() => {

    if (!email) {

      setMessage("Student email not found");

      return;

    }


    fetch(
      `http://localhost:5000/api/students/profile/${email}`
    )

      .then((response) => response.json())

      .then((data) => {

        console.log(
          "Profile data:",
          data
        );


        if (data.message) {

          setMessage(data.message);

        } else {

          setStudent(data);

          setName(data.name || "");

          setDepartment(
            data.department || ""
          );

          setYear(data.year || "");


          // Convert array to text
          setSkills(
            Array.isArray(data.skills)
              ? data.skills.join(", ")
              : ""
          );


          setBio(data.bio || "");

        }

      })

      .catch((error) => {

        console.log(error);

        setMessage(
          "Failed to load profile"
        );

      });

  }, [email]);


  // =================================
  // SAVE PROFILE
  // =================================

  const handleUpdate = async (e) => {

    e.preventDefault();


    // Convert skills text to array

    const skillsArray = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);


    console.log(
      "Skills being sent:",
      skillsArray
    );


    console.log(
      "Bio being sent:",
      bio
    );


    try {

      const response = await fetch(

        `http://localhost:5000/api/students/profile/${email}`,

        {

          method: "PUT",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            name: name,

            department: department,

            year: year,

            skills: skillsArray,

            bio: bio

          })

        }

      );


      const data =
        await response.json();


      console.log(
        "Update response:",
        data
      );


      if (response.ok) {

        // Update screen with
        // latest database data

        setStudent(data.student);

        setName(data.student.name);

        setDepartment(
          data.student.department
        );

        setYear(
          data.student.year
        );


        setSkills(
          data.student.skills.join(", ")
        );


        setBio(
          data.student.bio
        );


        setEditMode(false);


        setMessage(
          "Profile updated successfully"
        );


        setTimeout(() => {

          setMessage("");

        }, 3000);


      } else {

        setMessage(
          data.message ||
          "Failed to update profile"
        );

      }

    } catch (error) {

      console.log(error);

      setMessage(
        "Failed to update profile"
      );

    }

  };


  // =================================
  // LOADING
  // =================================

  if (!student) {

    return (

      <div className="profile-container">

        <h2>

          {message ||
            "Loading profile..."}

        </h2>

      </div>

    );

  }


  // =================================
  // PAGE
  // =================================

  return (

    <div className="profile-container">


      <button

        className="back-button"

        onClick={() =>
          navigate("/dashboard")
        }

      >

        ← Back to Dashboard

      </button>


      <h1>
        My Profile
      </h1>


      {message && (

        <div className="profile-message">

          {message}

        </div>

      )}


      {/* ============================
          VIEW PROFILE
          ============================ */}

      {!editMode ? (

        <div className="profile-box">


          <div className="profile-avatar">

            👤

          </div>


          <h2>

            {student.name}

          </h2>


          <p>

            <strong>
              Email:
            </strong>{" "}

            {student.email}

          </p>


          <p>

            <strong>
              Department:
            </strong>{" "}

            {student.department}

          </p>


          <p>

            <strong>
              Year:
            </strong>{" "}

            {student.year}

          </p>


          <p>

            <strong>
              Skills:
            </strong>{" "}

            {student.skills &&
            student.skills.length > 0

              ? student.skills.join(", ")

              : "No skills added yet"}

          </p>


          <p>

            <strong>
              Bio:
            </strong>{" "}

            {student.bio

              ? student.bio

              : "No bio added yet"}

          </p>


          <button

            className="edit-button"

            onClick={() =>
              setEditMode(true)
            }

          >

            Edit Profile

          </button>


        </div>


      ) : (


        /* ============================
           EDIT PROFILE
           ============================ */

        <div className="profile-box">


          <h2>
            Edit Profile
          </h2>


          <form
            onSubmit={handleUpdate}
          >


            <label>
              Name
            </label>

            <input

              type="text"

              value={name}

              onChange={(e) =>
                setName(e.target.value)
              }

              required

            />


            <label>
              Email
            </label>

            <input

              type="email"

              value={student.email}

              disabled

            />


            <label>
              Department
            </label>

            <input

              type="text"

              value={department}

              onChange={(e) =>
                setDepartment(
                  e.target.value
                )
              }

              required

            />


            <label>
              Year
            </label>

            <select

              value={year}

              onChange={(e) =>
                setYear(e.target.value)
              }

              required

            >

              <option value="1st Year">
                1st Year
              </option>

              <option value="2nd Year">
                2nd Year
              </option>

              <option value="3rd Year">
                3rd Year
              </option>

              <option value="4th Year">
                4th Year
              </option>

            </select>


            {/* ========================
                SKILLS
                ======================== */}

            <label>
              Skills
            </label>

            <input

              type="text"

              placeholder="Java, Python, React"

              value={skills}

              onChange={(e) =>
                setSkills(e.target.value)
              }

            />

            <small>

              Example:
              Java, Python, React, MongoDB

            </small>


            {/* ========================
                BIO
                ======================== */}

            <label>
              Bio
            </label>

            <textarea

              placeholder="Tell something about yourself"

              value={bio}

              onChange={(e) =>
                setBio(e.target.value)
              }

              rows="5"

            />


            {/* ========================
                BUTTONS
                ======================== */}

            <div className="button-group">


              <button

                type="submit"

                className="save-button"

              >

                Save Changes

              </button>


              <button

                type="button"

                className="cancel-button"

                onClick={() =>
                  setEditMode(false)
                }

              >

                Cancel

              </button>


            </div>


          </form>

        </div>

      )}

    </div>

  );

}


export default Profile;