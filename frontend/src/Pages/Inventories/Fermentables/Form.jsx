import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';

import useAuthRedirect from '../../../hooks/useAuthRedirect';
import useFormMode from '../../../hooks/useFormMode';

// Components
import { LoadingButton } from '@/Components/LoadingButton';
import HelpHint from "@/Components/HelpHint";

import {
  fetchFermentableById,
  updateFermentable,
  addFermentable,
} from '../../../services/fermentables';

import { showErrorToast } from '../../../utils/notifications';
import getFormTitle from '../../../utils/formTitle';
import AuthContext from '../../../context/AuthContext';

// Styles
import '../../../Styles/crud.css';
import '../../../Styles/skeleton.css';

export default function NewFermentable() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const { isEditing, isView } = useFormMode();
  const [isLoading, setIsLoading] = useState(!!id);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      supplier: '',
      description: '',
      type: 'Base',
      ebc: '',
      potentialExtract: '',
    },
  });

  // =======================
  // useEffects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    const loadFermentable = async () => {
      if (!id) { setIsLoading(false); return; }

      try {
        setIsLoading(true);
        const fermentable = await fetchFermentableById(user.token, id);
        reset({
          name: fermentable.name || '',
          supplier: fermentable.supplier || '',
          description: fermentable.description || '',
          type: fermentable.type || 'Base',
          ebc: fermentable.ebc ?? '',
          potentialExtract: fermentable.potentialExtract != null
            ? Number(fermentable.potentialExtract).toFixed(3)
            : '',
        });
      } catch {
        navigate('/FermentableList');
      } finally {
        setIsLoading(false);
      }
    };

    loadFermentable();
  }, [id, user, navigate, reset]);

  const title = getFormTitle('Fermentable', isEditing, isView);

  const onValid = async (data) => {
    const payload = {
      ...data,
    };

    try {
      if (isEditing) {
        await updateFermentable(user.token, id, payload);
      } else {
        await addFermentable(user.token, payload);
      }
      navigate('/FermentableList');
    } catch (err) {
      //
    }
  };

  const onError = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      showErrorToast(firstError.message);
    }
  };

  return (
    <div className="crud-container">
      <section>
        <h1>{title}</h1>
      </section>
      <div className="content" aria-busy={isLoading}>
        {isLoading ? (
          <div className="sk sk-card" style={{ padding: 16 }}>
            <div className="inputs-row">
              <div className="input-field" style={{ width: 430 }}>
                <div className="sk-line w60" style={{ height: 12, marginBottom: 8 }} />
                <div className="sk-line w80" style={{ height: 36 }} />
              </div>
              <div className="input-field" style={{ flex: 1 }}>
                <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                <div className="sk-line w80" style={{ height: 36 }} />
              </div>
            </div>
            <div className="inputs-row" style={{ marginTop: 16 }}>
              <div className="input-field" style={{ width: '100%' }}>
                <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                <div className="sk-line w80" style={{ height: 90 }} />
              </div>
            </div>
            <div className="inputs-row" style={{ marginTop: 16 }}>
              <div className="input-field" style={{ width: 220 }}>
                <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                <div className="sk-line w80" style={{ height: 36 }} />
              </div>
              <div className="input-field" style={{ width: 220 }}>
                <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                <div className="sk-line w80" style={{ height: 36 }} />
              </div>
              <div className="input-field" style={{ width: 220 }}>
                <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                <div className="sk-line w80" style={{ height: 36 }} />
              </div>
            </div>
          </div>
        ) : (
          <form id="formSubmit" onSubmit={handleSubmit(onValid, onError)}>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  {...register('name')}
                  disabled={isView}
                  style={{ width: '430px' }}
                />
              </div>
              <div className="input-field">
                <label htmlFor="supplier">Supplier</label>
                <input
                  id="supplier"
                  {...register('supplier')}
                  disabled={isView}
                />
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  {...register('description')}
                  disabled={isView}
                />
              </div>
            </div>
            <div className="inputs-row">
              <div className="input-field">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  {...register('type')}
                  disabled={isView}
                >
                  <option value="Base">Base</option>
                  <option value="Specialty">Specialty</option>
                  <option value="Adjunct">Adjunct</option>
                </select>
              </div>
              <div className="input-field">
                <label htmlFor="ebc">
                  Color Degree
                  <HelpHint text="Color degree indicates the beer’s color contributed by the malt, 
                               measured in EBC or SRM units, from pale to dark." />
                </label>
                <input
                  id="ebc"
                  type="number"
                  step="any"
                  {...register('ebc')}
                  disabled={isView}
                />
              </div>
              <div className="input-field">
                <label htmlFor="potentialExtract">
                  Potential Extract
                  <HelpHint text="Potential extract is the amount of fermentable sugars the malt can provide,
                                usually expressed as specific gravity (e.g., 1.037).
                                It indicates the malt’s capacity to contribute to alcohol production." />
                </label>
                <input
                  id="potentialExtract"
                  type="number"
                  step="any"
                  {...register('potentialExtract')}
                  disabled={isView}
                />
              </div>
            </div>
          </form>
        )}
      </div>
      {!isView && !isLoading && (
        <LoadingButton
          form="formSubmit"
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="crud-save-button"
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </LoadingButton>
      )}
    </div>
  );
}
