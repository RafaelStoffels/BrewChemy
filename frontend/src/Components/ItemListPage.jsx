import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';

import Sidebar from './Sidebar';
import SearchInput from './SearchInput';

import '../Styles/list.css';

export default function ItemListPage({
  title,
  itemList,
  onSearch,
  onDelete,
  onUpdate,
  onDetails,
  renderItem,
  addNewRoute,
}) {
  return (
    <div>
      <Sidebar />
      <div className="list-container">
        <div className="div-addButton">
          <Link className="Addbutton" to={addNewRoute}>
            Add new
            {title.toLowerCase()}
          </Link>
        </div>

        <SearchInput onSearch={onSearch} />

        <h1>{title}</h1>
        <ul>
          {itemList.map((item) => (
            <li key={item.id}>
              <h2 className="item-title">
                {item.name}
                {' '}
                {item.officialId && <span className="custom-label">[custom]</span>}
              </h2>

              <div className="item-details">
                {renderItem(item)}
              </div>

              <div className="button-group">
                <button onClick={() => onDetails(item.userId, item.id)} type="button" className="icon-button">
                  <FiBookOpen size={20} />
                </button>
                <button onClick={() => onUpdate(item.userId, item.id)} type="button" className="icon-button">
                  <FiEdit size={20} />
                </button>
                <button onClick={() => onDelete(item.userId, item.id)} type="button" className="icon-button">
                  <FiTrash2 size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

ItemListPage.propTypes = {
  title: PropTypes.string.isRequired,
  itemList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      description: PropTypes.string,
      officialId: PropTypes.string,
      userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  onSearch: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDetails: PropTypes.func.isRequired,
  renderItem: PropTypes.func.isRequired,
  addNewRoute: PropTypes.string.isRequired,
};
