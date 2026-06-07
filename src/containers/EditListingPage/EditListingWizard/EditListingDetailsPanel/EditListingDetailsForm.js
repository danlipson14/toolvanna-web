import React, { useState, useEffect } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

// Import util modules
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { displayDescription } from '../../../../util/configHelpers.js';
import toolcatalog from '../../../../data/toolcatalog';
import { useConfiguration } from '../../../../context/configurationContext.js';
import { EXTENDED_DATA_SCHEMA_TYPES } from '../../../../util/types';
import {
  isFieldForCategory,
  isFieldForListingType,
  isValidCurrencyForTransactionProcess,
} from '../../../../util/fieldHelpers';
import { maxLength, required, composeValidators } from '../../../../util/validators';

// Import shared components
import {
  Form,
  Button,
  FieldSelect,
  FieldTextInput,
  Heading,
  CustomExtendedDataField,
} from '../../../../components';

// Import modules from this directory
import css from './EditListingDetailsForm.module.css';

const TITLE_MAX_LENGTH = 1000;

const ErrorMessage = props => {
  const { fetchErrors } = props;
  const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};

  const errorMessage = updateListingError ? (
    <FormattedMessage id="EditListingDetailsForm.updateFailed" />
  ) : createListingDraftError ? (
    <FormattedMessage id="EditListingDetailsForm.createListingDraftError" />
  ) : showListingsError ? (
    <FormattedMessage id="EditListingDetailsForm.showListingFailed" />
  ) : null;

  return errorMessage ? <p className={css.error}>{errorMessage}</p> : null;
};

const FieldHidden = props => {
  const { name } = props;

  return (
    <Field id={name} name={name} type="hidden" className={css.unitTypeHidden}>
      {fieldRenderProps => <input {...fieldRenderProps?.input} />}
    </Field>
  );
};

const FieldSelectListingType = props => {
  const {
    name,
    listingTypes,
    hasPredefinedListingType,
    onListingTypeChange,
    formApi,
    formId,
    intl,
  } = props;

  const hasMultipleListingTypes = listingTypes?.length > 1;

  const handleOnChange = value => {
    const selectedListingType = listingTypes.find(config => config.listingType === value);

    formApi.change('transactionProcessAlias', selectedListingType.transactionProcessAlias);
    formApi.change('unitType', selectedListingType.unitType);

    if (onListingTypeChange) {
      onListingTypeChange(selectedListingType);
    }
  };

  const getListingTypeLabel = listingType => {
    const listingTypeConfig = listingTypes.find(config => config.listingType === listingType);
    return listingTypeConfig ? listingTypeConfig.label : listingType;
  };

  return hasMultipleListingTypes && !hasPredefinedListingType ? (
    <>
      <FieldSelect
        id={formId ? `${formId}.${name}` : name}
        name={name}
        className={css.listingTypeSelect}
        label={intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeLabel' })}
        validate={required(
          intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeRequired' })
        )}
        onChange={handleOnChange}
      >
        <option disabled value="">
          {intl.formatMessage({ id: 'EditListingDetailsForm.listingTypePlaceholder' })}
        </option>

        {listingTypes.map(config => {
          const type = config.listingType;

          return (
            <option key={type} value={type}>
              {config.label}
            </option>
          );
        })}
      </FieldSelect>

      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </>
  ) : hasMultipleListingTypes && hasPredefinedListingType ? (
    <div className={css.listingTypeSelect}>
      <Heading as="h5" rootClassName={css.selectedLabel}>
        {intl.formatMessage({ id: 'EditListingDetailsForm.listingTypeLabel' })}
      </Heading>

      <p className={css.selectedValue}>{getListingTypeLabel(formApi.getFieldState(name)?.value)}</p>

      <FieldHidden name={name} />
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </div>
  ) : (
    <>
      <FieldHidden name={name} />
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </>
  );
};

const findCategoryConfig = (categories, categoryIdToFind) => {
  return categories?.find(category => category.id === categoryIdToFind);
};

const CategoryField = props => {
  const { currentCategoryOptions, level, values, prefix, handleCategoryChange, intl } = props;

  const currentCategoryKey = `${prefix}${level}`;
  const categoryConfig = findCategoryConfig(currentCategoryOptions, values[`${prefix}${level}`]);

  return (
    <>
      {currentCategoryOptions ? (
        <FieldSelect
          key={currentCategoryKey}
          id={currentCategoryKey}
          name={currentCategoryKey}
          className={css.listingTypeSelect}
          onChange={event => handleCategoryChange(event.target.value, level, currentCategoryOptions)}
          label={intl.formatMessage(
            { id: 'EditListingDetailsForm.categoryLabel' },
            { categoryLevel: currentCategoryKey }
          )}
          validate={required(
            intl.formatMessage(
              { id: 'EditListingDetailsForm.categoryRequired' },
              { categoryLevel: currentCategoryKey }
            )
          )}
        >
          <option disabled value="">
            {intl.formatMessage(
              { id: 'EditListingDetailsForm.categoryPlaceholder' },
              { categoryLevel: currentCategoryKey }
            )}
          </option>

          {currentCategoryOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </FieldSelect>
      ) : null}

      {categoryConfig?.subcategories?.length > 0 ? (
        <CategoryField
          currentCategoryOptions={categoryConfig.subcategories}
          level={level + 1}
          values={values}
          prefix={prefix}
          handleCategoryChange={handleCategoryChange}
          intl={intl}
        />
      ) : null}
    </>
  );
};

const FieldSelectCategory = props => {
  const { prefix, listingCategories, formApi, intl, setAllCategoriesChosen, values } = props;

  useEffect(() => {
    const count = Object.keys(values).filter(key => key.startsWith(prefix) && values[key]).length;
    setAllCategoriesChosen(count > 0);
  }, [prefix, setAllCategoriesChosen, values]);

  const countSelectedCategories = () => {
    return Object.keys(values).filter(key => key.startsWith(prefix) && values[key]).length;
  };

  const handleCategoryChange = (categoryId, level, currentCategoryOptions) => {
    const selectedCatLength = countSelectedCategories();

    if (level < selectedCatLength) {
      for (let i = selectedCatLength; i > level; i--) {
        formApi.change(`${prefix}${i}`, null);
      }
    }

    const categoryConfig = findCategoryConfig(currentCategoryOptions, categoryId);
    const subcategories = categoryConfig?.subcategories || [];
    setAllCategoriesChosen(subcategories.length === 0);
  };

  return (
    <CategoryField
      currentCategoryOptions={listingCategories}
      level={1}
      values={values}
      prefix={prefix}
      handleCategoryChange={handleCategoryChange}
      intl={intl}
    />
  );
};

const AddListingFields = props => {
  const { listingType, listingFieldsConfig, selectedCategories, formId, intl } = props;
  const targetCategoryIds = Object.values(selectedCategories);

  const fields = listingFieldsConfig.reduce((pickedFields, fieldConfig) => {
    const { key, schemaType, scope } = fieldConfig || {};
    const namespacedKey = scope === 'public' ? `pub_${key}` : `priv_${key}`;

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isProviderScope = ['public', 'private'].includes(scope);
    const isTargetListingType = isFieldForListingType(listingType, fieldConfig);
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig);

    const shouldHideCustomField = ['condition', 'sellerNotes'].includes(key);

    return isKnownSchemaType &&
      isProviderScope &&
      isTargetListingType &&
      isTargetCategory &&
      !shouldHideCustomField
      ? [
          ...pickedFields,
          <CustomExtendedDataField
            key={namespacedKey}
            name={namespacedKey}
            fieldConfig={fieldConfig}
            defaultRequiredMessage={intl.formatMessage({
              id: 'EditListingDetailsForm.defaultRequiredMessage',
            })}
            formId={formId}
          />,
        ]
      : pickedFields;
  }, []);

  return <>{fields}</>;
};

const getListingTypeConfig = (config, listingType) => {
  return config.listing.listingTypes?.find(conf => conf.listingType === listingType);
};

const EditListingDetailsFormInner = formRenderProps => {
  const {
    autoFocus,
    className,
    disabled,
    ready,
    formId = 'EditListingDetailsForm',
    form: formApi,
    handleSubmit,
    onListingTypeChange,
    invalid,
    pristine,
    marketplaceCurrency,
    marketplaceName,
    selectableListingTypes,
    selectableCategories,
    hasPredefinedListingType = false,
    pickSelectedCategories,
    categoryPrefix,
    saveActionMsg,
    updated,
    updateInProgress,
    fetchErrors,
    listingFieldsConfig = [],
    listingCurrency,
    values,
  } = formRenderProps;

  const intl = useIntl();
  const config = useConfiguration();

  const [allCategoriesChosen, setAllCategoriesChosen] = useState(false);
  const [toolLocked, setToolLocked] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const { listingType, transactionProcessAlias, unitType } = values;

  const titleRequiredMessage = intl.formatMessage({
    id: 'EditListingDetailsForm.titleRequired',
  });

  const maxLengthMessage = intl.formatMessage(
    { id: 'EditListingDetailsForm.maxLength' },
    { maxLength: TITLE_MAX_LENGTH }
  );

  const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);

  const currencyToCheck = listingCurrency || marketplaceCurrency;

  const isCompatibleCurrency = isValidCurrencyForTransactionProcess(
    transactionProcessAlias,
    currencyToCheck
  );

  const hasCategories = selectableCategories && selectableCategories.length > 0;
  const showCategories = listingType && hasCategories;
  const showTitle = hasCategories ? allCategoriesChosen : listingType;

  const listingTypeConfig = getListingTypeConfig(config, listingType);
  const showDescriptionMaybe = displayDescription(listingTypeConfig);
  const showDescription = hasCategories
    ? allCategoriesChosen && showDescriptionMaybe
    : showDescriptionMaybe;

  const showListingFields = hasCategories ? allCategoriesChosen : listingType;

  const classes = classNames(css.root, className);
  const submitReady = (updated && pristine) || ready;
  const submitInProgress = updateInProgress;
  const hasMandatoryListingTypeData = listingType && transactionProcessAlias && unitType;

  const toolActivationIncomplete = !selectedTool || !selectedCondition;

  const submitDisabled =
    invalid ||
    disabled ||
    submitInProgress ||
    !hasMandatoryListingTypeData ||
    !isCompatibleCurrency ||
    toolActivationIncomplete;

  










const handleToolSearch = e => {
  const query = (e.target.value || '').trim().toLowerCase();

  if (!query || query.length < 2) {
    setSuggestions([]);
    return;
  }

  const words = query.split(' ').filter(Boolean);

  const results = toolcatalog
    .filter(tool => {
      const searchText = `${tool.brand || ''} ${tool.name || ''}`.toLowerCase();

      return words.every(word => searchText.includes(word));
    })
    .sort((a, b) => {
      const aText = `${a.brand || ''} ${a.name || ''}`.toLowerCase();
      const bText = `${b.brand || ''} ${b.name || ''}`.toLowerCase();

      const aStarts = aText.startsWith(query);
      const bStarts = bText.startsWith(query);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return 0;
    });

  setSuggestions(results.slice(0, 20));
};














const getPrice = () => {
  if (!selectedTool || !selectedCondition) return null;

  const newPrice = Number(selectedTool.newPrice || 0);

  if (selectedCondition === 'new') {
    return Math.round(newPrice);
  }

  if (selectedCondition === 'good') {
    return Math.round(newPrice * 0.76);
  }

  if (selectedCondition === 'acceptable') {
    return Math.round(newPrice * 0.57);
  }

  return null;
};

  const handleConditionSelect = condition => {
    setSelectedCondition(condition);
    formApi.change('condition', condition);
  };

  const calculatedPrice = getPrice();

  const selectedToolTitle = selectedTool
    ? `${selectedTool.brand || ''} ${selectedTool.model || ''} ${selectedTool.name || ''}`.trim()
    : '';

  return (
    <Form className={classes} onSubmit={handleSubmit}>
      <ErrorMessage fetchErrors={fetchErrors} />

     <div className={css.activationHeader}>
  <h1 className={css.activationTitle}>
    Your Tool Is Guaranteed To Sell
  </h1>

  <p className={css.activationSubtitle}>
    Post it to the marketplace in seconds. If it doesn't sell in 72 hours, WeBuyTools buys it.
  </p>
</div>

      <FieldSelectListingType
        name="listingType"
        listingTypes={selectableListingTypes}
        hasPredefinedListingType={hasPredefinedListingType}
        onListingTypeChange={onListingTypeChange}
        formApi={formApi}
        formId={formId}
        intl={intl}
      />

      {showCategories && isCompatibleCurrency && (
        <FieldSelectCategory
          values={values}
          prefix={categoryPrefix}
          listingCategories={selectableCategories}
          formApi={formApi}
          intl={intl}
          setAllCategoriesChosen={setAllCategoriesChosen}
        />
      )}

      {showTitle && isCompatibleCurrency && (
        <div className={css.toolSearchContainer}>
          <FieldTextInput
            id={`${formId}title`}
            name="title"
            className={css.title}
            type="text"
            parse={v => v}
            label="Search your tool"
            placeholder="Type brand, model, or tool name..."
            maxLength={TITLE_MAX_LENGTH}
            onChange={e => {
              formApi.change('title', e.target.value);
              handleToolSearch(e);
            }}
            validate={composeValidators(required(titleRequiredMessage), maxLength60Message)}
            autoFocus={autoFocus}
          />

          {!toolLocked && suggestions.length > 0 && (
            <div className={css.suggestionsBox}>
              {suggestions.map(tool => {
                const title = `${tool.brand || ''} ${tool.model || ''} ${tool.name || ''}`.trim();

                return (
                  <button
                    type="button"
                    key={tool.key || tool.model || `${tool.brand}-${tool.name}`}
                    className={css.suggestionItem}
                    onMouseDown={event => {
                      event.preventDefault();

                      formApi.change('title', title);
                      formApi.change('description', title);
                      formApi.change('sellerNotes', '');
                      formApi.change('condition', '');

                      setSelectedTool(tool);
                      setToolLocked(false);
                      setSelectedCondition('');
                      setSuggestions([]);
                    }}
                  >
                    {tool.image ? (
                      <img
                        src={tool.image}
                        alt={tool.name || 'Tool'}
                        className={css.suggestionImage}
                      />
                    ) : (
                      <div className={css.suggestionImageFallback}>W</div>
                    )}

                    <span>{title}</span>
                  </button>
                );
              })}
            </div>
          )}

      
        </div>
      )}

      {selectedTool && isCompatibleCurrency && (
        <div className={css.activationCard}>
          <div className={css.selectedToolBox}>
            <div className={css.selectedToolImageWrap}>
              {selectedTool.image ? (
                <img
                  src={selectedTool.image}
                  alt={selectedToolTitle || 'Selected tool'}
                  className={css.selectedToolImage}
                />
              ) : (
                <div className={css.selectedToolImageFallback}>W</div>
              )}
            </div>

            <div className={css.selectedToolContent}>
              <div className={css.selectedToolLabel}>Selected tool</div>
              <h2 className={css.selectedToolTitle}>{selectedToolTitle}</h2>
              
            </div>
          </div>

          <div className={css.conditionSection}>
            <h3 className={css.conditionTitle}>What condition is it in?</h3>

            <div className={css.conditionGrid}>
              <button
                type="button"
                className={classNames(css.conditionCard, {
                  [css.conditionCardSelected]: selectedCondition === 'new',
                })}
                onClick={() => handleConditionSelect('new')}
              >
                <span className={css.conditionName}>New</span>
                <span className={css.conditionText}>Unused or open box</span>
              </button>

              <button
                type="button"
                className={classNames(css.conditionCard, {
                  [css.conditionCardSelected]: selectedCondition === 'good',
                })}
                onClick={() => handleConditionSelect('good')}
              >
                <span className={css.conditionName}>Used Good</span>
                <span className={css.conditionText}>Works properly</span>
              </button>

              <button
                type="button"
                className={classNames(css.conditionCard, {
                  [css.conditionCardSelected]: selectedCondition === 'acceptable',
                })}
                onClick={() => handleConditionSelect('acceptable')}
              >
                <span className={css.conditionName}>Used Acceptable</span>
                <span className={css.conditionText}>Working with wear</span>
              </button>
            </div>
          </div>

          {selectedCondition && calculatedPrice ? (
            <div className={css.priceHeroBox}>
  <div className={css.priceHeroInline}>
    <span className={css.priceHeroLabel}>YOU GET PAID:</span>
    <span className={css.priceHeroAmount}>${calculatedPrice}</span>
  </div>
</div>
          ) : null}
        </div>
      )}

      <FieldHidden name="condition" />

      {showDescription && isCompatibleCurrency && <FieldHidden name="description" />}

      {showListingFields && isCompatibleCurrency && (
        <AddListingFields
          listingType={listingType}
          listingFieldsConfig={listingFieldsConfig}
          selectedCategories={pickSelectedCategories(values)}
          formId={formId}
          intl={intl}
        />
      )}

      {!isCompatibleCurrency && listingType && (
        <p className={css.error}>
          <FormattedMessage
            id="EditListingDetailsForm.incompatibleCurrency"
            values={{ marketplaceName, marketplaceCurrency }}
          />
        </p>
      )}

      <Button
        className={css.submitButton}
        type="submit"
        inProgress={submitInProgress}
        disabled={submitDisabled}
        ready={submitReady}
      >
        {selectedCondition && calculatedPrice ? `Activate for $${calculatedPrice}` : saveActionMsg}
      </Button>
    </Form>
  );
};

const EditListingDetailsForm = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => <EditListingDetailsFormInner {...formRenderProps} />}
  />
);

export default EditListingDetailsForm;