import React from 'react'
import './ListStudent.scss'
const ListStudent = () => {
  return (
    <div className="list__student__container">
      <div className="list__student">
        <div className="list__student__heading">
          <div className="list__student__heading__title">
            <h2>Manage Student</h2>
          </div>

          <div className="list__student__heading__feature">
            <i className="fa-solid fa-filter"></i>
            <i className="fa-solid fa-plus"></i>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListStudent
