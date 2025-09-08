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

import { fetchYeastById, updateYeast, addYeast } from '../../../services/yeasts';
import { showErrorToast } from '../../../utils/notifications';
import getFormTitle from '../../../utils/formTitle';

import AuthContext from '../../../context/AuthContext';

import '../../../Styles/crud.css';
import '../../../Styles/skeleton.css';

export default function NewYeast() {
  const { user } = useContext(AuthContext);
  const { recordUserId, id } = useParams();
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
      manufacturer: '',
      description: '',
      flavorProfile: '',
      type: 'Ale',
      form: 'Dry',
      attenuation: '',
      temperatureRange: '',
      flocculation: 'Low',
    },
  });

  // =======================
  // useEffects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    const loadYeast = async () => {
      if (!id) { setIsLoading(false); return; }

      try {
        setIsLoading(true);
        const yeast = await fetchYeastById(user.token, recordUserId, id);
        reset({
          name: yeast.name || '',
          manufacturer: yeast.manufacturer || '',
          description: yeast.description || '',
          flavorProfile: yeast.flavorProfile || '',
          type: yeast.type || 'Ale',
          form: yeast.form || 'Dry',
          attenuation: yeast.attenuation ?? '',
          temperatureRange: yeast.temperatureRange || '',
          flocculation: yeast.flocculation || 'Low',
        });
      } catch {
        navigate('/YeastList');
      } finally {
        setIsLoading(false);
      }
    };

    loadYeast();
  }, [id, user, navigate, recordUserId, reset]);

  const title = getFormTitle('Yeast', isEditing, isView);

  const onValid = async (data) => {
    const payload = {
      ...data,
      itemUserId: recordUserId,
    };

    try {
      if (isEditing) {
        await updateYeast(user.token, id, payload);
      } else {
        await addYeast(user.token, payload);
      }
      navigate('/YeastList');
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
    <div>
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
                <div className="input-field" style={{ width: 220 }}>
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
                <div className="input-field" style={{ width: 140 }}>
                  <div className="sk-line w60" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 36 }} />
                </div>
                <div className="input-field" style={{ width: 160 }}>
                  <div className="sk-line w60" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 36 }} />
                </div>
                <div className="input-field" style={{ width: 180 }}>
                  <div className="sk-line w60" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 36 }} />
                </div>
                <div className="input-field" style={{ width: 180 }}>
                  <div className="sk-line w60" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 36 }} />
                </div>
                <div className="input-field" />
              </div>
            </div>
          ) : (
            <form id="formSubmit" onSubmit={handleSubmit(onValid, onError)}>
              <div className="inputs-row">
                <div className="input-field">
                  <label>
                    Name
                    <input
                      {...register('name')}
                      disabled={isView}
                      style={{ width: '430px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label>
                    Manufacturer
                    <input
                      {...register('manufacturer')}
                      disabled={isView}
                    />
                  </label>
                </div>
              </div>

              <div className="inputs-row">
                <div className="input-field">
                  <label>
                    Description
                    <textarea
                      {...register('description')}
                      disabled={isView}
                    />
                  </label>
                </div>
              </div>

              <div className="inputs-row">
                <div className="input-field">
                  <label>
                    Attenuation %
                    <HelpHint text="Attenuation indicates how much sugar the yeast can ferment, expressed as a percentage.
                                    Higher attenuation means a drier beer; lower attenuation leaves more sweetness." />
                    <input
                      style={{ width: '120px' }}
                      type="number"
                      {...register('attenuation')}
                      disabled={isView}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label>
                    Type
                    <select style={{ width: '150px' }} {...register('type')} disabled={isView}>
                      <option value="Ale">Ale</option>
                      <option value="Lager">Lager</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Champagne">Champagne</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Wine">Wine</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                </div>

                <div className="input-field">
                  <label>
                    Form
                    <select style={{ width: '170px' }} {...register('form')} disabled={isView}>
                      <option value="Dry">Dry</option>
                      <option value="Liquid">Liquid</option>
                      <option value="Culture">Culture</option>
                      <option value="Slant">Slant</option>
                    </select>
                  </label>
                </div>

                <div className="input-field">
                  <label>
                    Flocculation
                    <HelpHint text="Flocculation describes how easily yeast cells clump together and settle out after fermentation. 
                                    High flocculation means the beer clears faster; low flocculation keeps yeast longer in suspension." />
                    <select style={{ width: '180px' }} {...register('flocculation')} disabled={isView}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="Medium - High">Medium - High</option>
                      <option value="High">High</option>
                      <option value="Very High">Very High</option>
                    </select>
                  </label>
                </div>
                <div className="input-field" />
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
    </div>
  );
}
