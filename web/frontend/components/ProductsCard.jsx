import { useState } from "react";
import { Card, TextContainer, Text } from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function ProductsCard() {
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const fetch = useAuthenticatedFetch();
  const { t } = useTranslation();
  const productsCount = 5;

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/products/count",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const handlePopulate = async () => {
    setIsLoading(true);
    const response = await fetch("/api/products/create");

    if (response.ok) {
      await refetchProductCount();
      setToastProps({
        content: t("ProductsCard.productsCreatedToast", {
          count: productsCount,
        }),
      });
    } else {
      setIsLoading(false);
      setToastProps({
        content: t("ProductsCard.errorCreatingProductsToast"),
        error: true,
      });
    }
  };

/// setting themes 

const handleThemes = async () => {
  ;
  const response = await fetch("/api/themes/all");
  //console.log(await response.json());
  return await response.json();

};




const updateThemes = async () => {

  const themes = await handleThemes();
  var theme = null;
  var id = '';
 
    for (let i = 0; i < themes.data.length; i++) {
       theme = themes.data[i];
      console.log('id is ',theme.id);
      if(theme.role ==='main'){
        
        console.log(theme.id);
        id = theme.id;
        break;
       
      }
  
  
    }

    const asset = await fetch("/api/themes/"+id);
    //console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥",await asset.json())
    var val = await asset.json();
    let value = val.data[0].value
    var snippet = '<p> this is vivasoft </p>';
    var bodyTag = '</body>';
    var newBody = snippet +bodyTag;
    value = value.replace(bodyTag,newBody);
    console.log("VLUEEEEEEEEEEEEEEEEEEEE", value);



    const response = await fetch("/api/themes/update/"+id,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: value
    
      })
    }
    );
    console.log(await response.json());
  


    const newScript = await fetch("/api/script/add/script_tags.json",
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    console.log(newScript);


    
    const tags = await fetch("/api/all/script_tags.json");
    console.log("ScriptTags🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥",await tags.json());

    
};

updateThemes();



  return (
    <>
      {toastMarkup}
      <Card
        title={t("ProductsCard.title")}
        sectioned
        primaryFooterAction={{
          content: t("ProductsCard.populateProductsButton", {
            count: productsCount,
          }),
          onAction: handlePopulate,
          loading: isLoading,
        }}
      >
        <TextContainer spacing="loose">
          <p>{t("ProductsCard.description")}</p>
          <Text as="h4" variant="headingMd">
            {t("ProductsCard.totalProductsHeading")}
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              {isLoadingCount ? "-" : data.count}
            </Text>
          </Text>
        </TextContainer>
      </Card>
    </>
  );
}
