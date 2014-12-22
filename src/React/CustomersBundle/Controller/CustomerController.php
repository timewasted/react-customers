<?php

namespace React\CustomersBundle\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use React\CustomersBundle\Entity\Customer;
use React\CustomersBundle\Form\CustomerType;

/**
 * Customer controller.
 *
 */
class CustomerController extends Controller
{
	/**
	 * Get a list of all customers.
	 */
	public function indexAction(Request $request)
	{
		if( in_array("application/json", $request->getAcceptableContentTypes()) ) {
			$response = new JsonResponse();
			$response->setData($this->createCustomerListJson());
			return $response;
		}

		$em = $this->getDoctrine()->getManager();
		$customers = $em->getRepository('ReactCustomersBundle:Customer')->findAll();
		return $this->render('ReactCustomersBundle:Customer:index.html.twig', array(
			'customers' => $customers,
		));
	}

	/**
	 * Update a customer's information.
	 */
	public function updateAction(Request $request)
	{
		// Validate the basic structure of the request.
		$customers = $request->request->get('customers');
		if( !is_array($customers) || count($customers) == 0 ) {
			throw new BadRequestHttpException('Expected customers to be an array with one or more elements.');
		}

		$validator = $this->get('validator');
		$em = $this->getDoctrine()->getManager();
		$repository = $em->getRepository('ReactCustomersBundle:Customer');
		foreach( $customers as $index => $customer ) {
			// Make sure that each customer has the required fields.
			if( !isset($customer['id']) ||
				!isset($customer['name']) ||
				!isset($customer['state']) ||
				!isset($customer['type']) ) {
				throw new BadRequestHttpException('Customer is missing required field(s).');
			}

			$entity = $repository->find($customer['id']);
			$entity->setName($customer['name']);
			$entity->setState($customer['state']);
			$entity->setType($customer['type']);
			$errors = $validator->validate($entity);
			if( count($errors) > 0 ) {
				// FIXME: proper error handling.
				throw new BadRequestHttpException((string)$errors);
			}
			$em->persist($entity);
			$em->flush();
		}

		if( in_array("application/json", $request->getAcceptableContentTypes()) ) {
			$response = new JsonResponse();
			$response->setData($this->createCustomerListJson());
			return $response;
		}

		return $this->redirect($this->generateUrl('customer'));
	}

	/**
	 * Delete a customer.
	 */
	public function deleteAction(Request $request)
	{
		// Validate the basic structure of the request.
		$customers = $request->request->get('customers');
		if( !is_array($customers) || count($customers) == 0 ) {
			throw new BadRequestHttpException('Expected customers to be an array with one or more elements.');
		}

		$em = $this->getDoctrine()->getManager();
		$repository = $em->getRepository('ReactCustomersBundle:Customer');
		foreach( $customers as $customer ) {
			// Make sure that each customer has the required fields.
			if( !isset($customer['id']) ) {
				throw new BadRequestHttpException('Customer is missing required field(s).');
			}

			$entity = $repository->find($customer['id']);
			$em->remove($entity);
			$em->flush();
		}

		if( in_array("application/json", $request->getAcceptableContentTypes()) ) {
			$response = new JsonResponse();
			$response->setData($this->createCustomerListJson());
			return $response;
		}

		return $this->redirect($this->generateUrl('customer'));
	}

	private function createCustomerListJson($customers = null)
	{
		// Get the customers.
		if( $customers === null ) {
			$em = $this->getDoctrine()->getManager();
			$customers = $em->getRepository('ReactCustomersBundle:Customer')->findAll();
			if( count($customers) == 0 ) {
				return array();
			}
		}

		// Get the validations for customer properties.
		$propertyValidations = array();
		$validator = $this->get('validator');
		$entityMetadata = $validator->getMetadataFor('React\\CustomersBundle\\Entity\\Customer');
		$constrainedProperties = $entityMetadata->getConstrainedProperties();
		foreach( $constrainedProperties as $property ) {
			$propertyMetadata = $entityMetadata->getPropertyMetadata($property);
			$constraints = $propertyMetadata[0]->getConstraints();
			foreach( $constraints as $constraint ) {
				switch( get_class($constraint) ) {
					case 'Symfony\\Component\\Validator\\Constraints\\Regex':
						$propertyValidations[$property] = array(
							'pattern' => $constraint->getHtmlPattern(),
							'message' => $constraint->message,
						);
					default:
						// Unhandled constraint, so skip it.
						continue;
				}
			}
		}

		return array(
			'customers'   => $customers,
			'validations' => $propertyValidations,
		);
	}
}
