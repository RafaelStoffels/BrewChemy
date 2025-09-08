import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiTrash2, FiEdit, FiBookOpen } from 'react-icons/fi';

import Sidebar from './Sidebar';
import SearchInput from './SearchInput';

import '../Styles/list.css';
import '../Styles/skeleton.css';

function SkeletonCard() {
  return (
    <li className="sk-card sk">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div className="sk-line w60" style={{ height: 16 }} />
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          <div className="sk-icon" /><div className="sk-icon" /><div className="sk-icon" />
        </div>
      </div>
      <div className="sk-line w40 thin" />
      <div className="sk-line w40 thin" style={{ marginTop: 6 }} />
      <div className="sk-line w40 thin" style={{ marginTop: 6 }} />
      <div className="sk-desc" style={{ marginTop: 12 }}>
        <div className="sk-line w80" />
        <div className="sk-line w80" />
        <div className="sk-line w60" />
      </div>
    </li>
  );
}

export default function ItemListPage({
  title,
  itemList,
  onSearch,
  onDelete,
  onUpdate,
  onDetails,
  renderItem,
  addNewRoute,
  isLoading = false,
  isFetching = false,
  skeletonCount = 8,
}) {
  return (
    <div>
      <Sidebar />
      <div className="list-container">
        <div className="div-addButton">
          <Link className="Addbutton" to={addNewRoute}>
            Add new
            {' '}
            {title.toLowerCase()}
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SearchInput onSearch={onSearch} />
          {isFetching && (
            <div role="status" aria-live="polite" className="inline-spinner">
              <span className="spin-dot" />
              <small>Atualizando…</small>
            </div>
          )}
        </div>

        <h1>{title}s</h1>
        {/* primeira carga -> skeletons */}
        {isLoading ? (
          <ul className="card-grid">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </ul>
        ) : (
          <>
            <ul className="card-grid">
              {itemList.map((item) => (
                <li key={item.id}>
                  <h2 className="item-title">
                    {item.name}{' '}
                    {item.officialId && <span className="custom-label">[custom]</span>}
                  </h2>

                  <div className="item-details">{renderItem(item)}</div>

                  <div className="button-group">
                    <button onClick={() => onDetails(item.userId, item.id)} type="button" className="icon-button" aria-label="Details">
                      <FiBookOpen size={20} />
                    </button>
                    <button onClick={() => onUpdate(item.userId, item.id)} type="button" className="icon-button" aria-label="Edit">
                      <FiEdit size={20} />
                    </button>
                    <button onClick={() => onDelete(item.userId, item.id)} type="button" className="icon-button" aria-label="Delete">
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* estado vazio amigável */}
            {itemList.length === 0 && (
              <div style={{ marginTop: 24, opacity: 0.7 }}>
                No {title.toLowerCase()}s found.
              </div>
            )}
          </>
        )}
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
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  skeletonCount: PropTypes.number,
};