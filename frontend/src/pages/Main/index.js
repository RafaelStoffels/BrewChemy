import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
/*
import api from '../../services/api';
*/
import './styles.css';


export default function Main() {
    const navigate = useNavigate();

    return (
        <div>
            <Link className=".back-link" to="/MaltList">
                <FiLogIn size={16} color="#E02041"/>
                    Malts
            </Link>
        </div>
    );
}