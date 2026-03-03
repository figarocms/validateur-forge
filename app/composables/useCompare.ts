export interface CompareParams {
    partenaire: string
    codeAgence: string
    refClient: string
    mediaId: string
}

export function useCompare() {
    const loading = useState('compare-loading', () => false)
    const prodData = useState<any>('compare-prodData', () => null)
    const integData = useState<any>('compare-integData', () => null)
    const prodError = useState<string | null>('compare-prodError', () => null)
    const integError = useState<string | null>('compare-integError', () => null)
    const selectedRef = useState<string>('compare-selectedRef', () => '')

    // Paramètres de recherche persistés pour le retour à la liste
    const searchParams = useState<CompareParams>('compare-searchParams', () => ({
        partenaire: '',
        codeAgence: '',
        refClient: '',
        mediaId: '',
    }))

    // Listes complètes des annonces
    const prodResults = computed(() => {
        if (!prodData.value) return []
        return prodData.value?.results || prodData.value?.listings || []
    })

    const integResults = computed(() => {
        if (!integData.value) return []
        return integData.value?.results || integData.value?.listings || []
    })

    // Extraire la référence d'une annonce
    function getListingRef(listing: any): string {
        return listing?.property?.reference || ''
    }

    // Trouver une annonce par sa référence dans une liste
    function findByRef(listings: any[], ref: string): any | null {
        if (!ref) return null
        return listings.find((l: any) => getListingRef(l) === ref) || null
    }

    // Annonces sélectionnées pour la page de détail — matchées par référence
    const selectedProdListing = computed(() => {
        return findByRef(prodResults.value, selectedRef.value)
    })

    const selectedIntegListing = computed(() => {
        return findByRef(integResults.value, selectedRef.value)
    })

    async function fetchEnv(env: 'PROD' | 'INTEG', params: CompareParams) {
        const queryParams = new URLSearchParams({
            partenaire: params.partenaire,
            codeAgence: params.codeAgence,
            refClient: params.refClient,
            mediaId: params.mediaId,
            env,
        })

        return await $fetch(`/api/compare?${queryParams.toString()}`)
    }

    async function compare(params: CompareParams) {
        loading.value = true
        prodData.value = null
        integData.value = null
        prodError.value = null
        integError.value = null
        selectedRef.value = ''

        // Persister les paramètres de recherche
        searchParams.value = { ...params }

        const [prodResult, integResult] = await Promise.allSettled([
            fetchEnv('PROD', params),
            fetchEnv('INTEG', params),
        ])

        if (prodResult.status === 'fulfilled') {
            prodData.value = prodResult.value
        } else {
            prodError.value = prodResult.reason?.data?.message || prodResult.reason?.message || 'Erreur PROD'
        }

        if (integResult.status === 'fulfilled') {
            integData.value = integResult.value
        } else {
            integError.value = integResult.reason?.data?.message || integResult.reason?.message || 'Erreur INTEG'
        }

        loading.value = false
    }

    function selectListing(reference: string) {
        selectedRef.value = reference
    }

    function resetAll() {
        loading.value = false
        prodData.value = null
        integData.value = null
        prodError.value = null
        integError.value = null
        selectedRef.value = ''
        searchParams.value = {
            partenaire: '',
            codeAgence: '',
            refClient: '',
            mediaId: '',
        }
    }

    return {
        loading,
        prodData,
        integData,
        prodError,
        integError,
        prodResults,
        integResults,
        selectedProdListing,
        selectedIntegListing,
        selectedRef,
        searchParams,
        compare,
        selectListing,
        resetAll,
    }
}
