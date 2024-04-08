import React, {useEffect, useState} from "react";
import {
    Alert,
    Button,
    Flex,
    hubspot,
    Image,
    Link,
    LoadingSpinner,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@hubspot/ui-extensions";
import img from './refresh-icon.png';

hubspot.extend(({context, runServerlessFunction, actions}) => (<Extension
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
    fetchProperties={actions.fetchCrmObjectProperties}
/>));

export const Extension = ({context, runServerless, sendAlert, fetchProperties}) => {
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(false);
    const [message, setMessage] = useState(false);
    const [projects, setProjects] = useState(null);
    const [pageCount, setPageCount] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [dataTable, setDataTable] = useState([]);
    const [userContext, setUserContext] = useState(false);
    const [amandaURL, setAmandaURL] = useState('#');

    //D'abord on récupère le context du user connecté (ID, etc)
    useEffect(() => {
        if (context && context.user) {
            setUserContext(context.user)
        }
    }, [context]);

    //Ensuite, on fait un appel à l'endpoint amanda pour fetch les données de calepinage
    useEffect(() => {
        if (userContext) {
            return getCalepinageProjectList();
        }
    }, [userContext, fetchProperties]);

    //En parallèle, on récupère les infos de la page puis l'id_amanda (entityID) associé au deal pour construire l'URL vers le calepinage
    useEffect(() => {
        fetchProperties('*')
            .then(properties => {
                if (properties.id_amanda) {
                    setAmandaURL(`http://dev3-prospection.tenergie.fr/?id=127&new=${properties.id_amanda}`)
                } else {
                    setErrorMessage({
                        title: 'Cette transaction n\'est pas encore synchronisée avec un projet Amanda.',
                        message: '',
                        variant: 'warning'
                    })
                }
            })
    }, [fetchProperties])

    //Une fois les données de calepinage fetché, on prépare le système de pagination du tableau à afficher (si + de 3 projets)
    useEffect(() => {
        if (pageCount && projects) {
            handleProjectsToDisplay(projects)
        }
    }, [pageCount, projects, currentPage]);

    //Et on set up le nombre de pages du tableau
    useEffect(() => {
        if (projects && projects.length) {
            handlePageCount(projects);
        }
    }, [projects]);

    //Petite fonction qui determine les projets à afficher
    const handleProjectsToDisplay = (projects) => {
        if (pageCount && projects) {
            const startIndex = (currentPage - 1) * 3;
            const endIndex = startIndex + 3;
            const filteredData = projects.slice(startIndex, endIndex);

            setDataTable(filteredData);
        }
    };

    //Petite fonction qui set up le nombre de pages
    const handlePageCount = (projects) => {
        if (projects && projects.length) {
            const pages = Math.ceil(projects.length / 3);
            setPageCount(pages)
        }
    };

    // Fonction async qui fetch les données de calepinage
    const getCalepinageProjectList = async () => {
        setLoading(true);
        setMessage(false);
        setErrorMessage(false);
        runServerless({
            name: 'myFunc',
            propertiesToSend: ['hs_object_id'],
            parameters: {'context': context, 'target': 'amanda_get_calepinage'},
        })
            .then((serverlessResponse) => {
                if (serverlessResponse.status == 'SUCCESS') {
                    const {response} = serverlessResponse;
                    if (response.amandaData?.datas?.length) {
                        setProjects(response.amandaData.datas)
                    } else {
                        setMessage({
                            title: 'Pas de projet de calepinage créé pour cette transaction.',
                            message: 'Cliquez sur le bouton ci dessus pour en ajouter. Les projets créés s\'afficheront ici.',
                            variant: 'info'
                        })
                    }
                } else {
                    setMessage({
                        title: 'Pas de projet de calepinage créé pour cette transaction.',
                        message: 'Cliquez sur le bouton ci dessus pour en ajouter. Les projets créés s\'afficheront ici.',
                        variant: 'info'
                    })
                }
            })
            .catch((error) => {

                setErrorMessage({
                    title: 'Erreur : getCalepinageProjectList() ',
                    message: 'Veuillez contacter votre administrateur ou ressayer ultérieurement, merci.',
                    variant: 'danger'
                })
            })
            .finally(() => {
                setLoading(false);
            });
    }

    //Optionnelle :
    //TODO sortable
    //TODO searchable

    if (loading) {
        return (<>
            <Flex
                direction={'row'}
                justify={'center'}
                wrap={'wrap'}
            >
                <LoadingSpinner/>
            </Flex>
        </>);
    }
    if (errorMessage) {
        return (<Alert title={errorMessage.title} variant={errorMessage.variant}>
            {errorMessage.message}
        </Alert>);
    }
    if (message) {
        return (<Flex
            direction={'row'}
            justify={'center'}
            wrap={'wrap'}
            gap={'small'}
        > <Flex
            direction={'row'}
            justify={'end'}
            wrap={'wrap'}
            gap={'small'}
        >
            <Button href={amandaURL} disabled={loading} onClick={() => {
            }}
                    variant={'primary'}>Ajouter un projet de calepinage</Button>
        </Flex>
            <Alert title={message.title} variant={message.variant}>
                <Flex
                    direction={'column'}
                    justify={'center'}
                    wrap={'wrap'}
                    gap={'small'}
                >
                    {message.message}
                    <Flex
                        direction={'row'}
                        justify={'center'}
                        wrap={'wrap'}
                        gap={'small'}
                    >
                        <Button size={'md'} disabled={loading} onClick={getCalepinageProjectList}
                                variant={'secondary'}>Rafraichir</Button>
                    </Flex>

                </Flex>

            </Alert></Flex>);
    }

    return (<>
        <Flex
            direction={'column'}
            justify={'center'}
            wrap={'wrap'}
            gap={5}
        >
            {projects ? <>
                <Flex
                    direction={'row'}
                    justify={'end'}
                    wrap={'wrap'}
                    gap={'small'}
                >
                    <Button href={amandaURL} disabled={loading} onClick={() => {
                    }}
                            variant={'primary'}>Ajouter un projet de calepinage</Button>
                </Flex>
                <Table
                    bordered={true}
                    paginated={projects.length > 3 ? true : false}
                    pageCount={pageCount}
                    onPageChange={(pageNumber) => {
                        setCurrentPage(pageNumber);
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableHeader>
                                <Flex
                                    direction={'row'}
                                    justify={'between'}
                                    wrap={'wrap'}
                                    gap={'small'}
                                >
                                    {projects.length} Calepinage(s) <Image alt={'Rafraichir les données'} src={img} width={25}
                                                          height={25}
                                                          onClick={getCalepinageProjectList}
                                />
                                </Flex>
                            </TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataTable.map((p, i) => {
                            return <TableRow key={i}>
                                <TableCell><Link href={p.url}>{p.name}</Link></TableCell>
                            </TableRow>
                        })}
                    </TableBody>
                </Table>  </> : <Flex
                direction={'row'}
                justify={'center'}
                wrap={'wrap'}
            ><LoadingSpinner/> </Flex>}
        </Flex>
    </>);
};
