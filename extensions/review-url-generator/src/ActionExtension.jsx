import { useEffect, useState } from "react";
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text,
  URLField,
  Link,
  Section,
  InlineStack,
} from "@shopify/ui-extensions-react/admin";

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.product-details.action.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const { i18n, close, data } = useApi(TARGET);
  console.log({ data });
  const [productTitle, setProductTitle] = useState("");
  const [productId, setProductId] = useState("");
  const [bvCampaignId, setBvCampaignId] = useState("");
  const [reviewLink, setReviewLink] = useState("");

  // Use direct API calls to fetch data from Shopify.
  // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
  useEffect(() => {
    (async function getProductInfo() {
      const getProductQuery = {
        query: `query Product($id: ID!) {
          product(id: $id) {
            title
            id
          }
        }`,
        variables: { id: data.selected[0].id },
      };

      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(getProductQuery),
      });

      if (!res.ok) {
        console.error("Network error");
      }

      const productData = await res.json();
      setProductTitle(productData.data.product.title);
      setProductId(productData.data.product.id.split("/").pop());
    })();
  }, [data.selected]);

  useEffect(() => {
    generateURL();
  }, [productId, bvCampaignId]);

  function generateURL() {
    const baseURL = `https://apps.bazaarvoice.com/deployments/rhone/main_site/production/en_US/container.html?bvaction=rr_submit_review?bvproductId=${productId}`;
    const fullURL = bvCampaignId
      ? `${baseURL}&bvcampaignId=${bvCampaignId}`
      : baseURL;

    setReviewLink(fullURL);
  }
  return (
    // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.
    <AdminAction
      primaryAction={<Button onPress={() => close()}>Done</Button>}
      secondaryAction={<Button onPress={() => close()}>Close</Button>}
    >
      <Section heading={`Generate a review URL for: ${productTitle}`}>
        <BlockStack padding="large none" blockGap="large">
          <InlineStack inlineAlignment="start" blockAlignment="center">
            <BlockStack maxInlineSize="30%">
              <Text>Optional Campaign ID:</Text>
            </BlockStack>
            <BlockStack>
              <URLField
                placeholder="optional_campaign_id"
                value={bvCampaignId}
                onChange={(value) => setBvCampaignId(value)}
              />
            </BlockStack>
          </InlineStack>
          <Link target="_blank" href={reviewLink}>
            {reviewLink}
          </Link>
        </BlockStack>
      </Section>
    </AdminAction>
  );
}
