<?php

namespace React\CustomersBundle\Entity;

use JsonSerializable;
use Doctrine\ORM\Mapping as ORM;

/**
 * Customer
 */
class Customer implements JsonSerializable
{
	/**
	 * @var integer
	 */
	private $id;

	/**
	 * @var string
	 */
	private $name;

	/**
	 * @var string
	 */
	private $state;

	/**
	 * @var string
	 */
	private $type;

	public function jsonSerialize()
	{
		return array(
			'id'    => $this->id,
			'name'  => $this->name,
			'state' => $this->state,
			'type'  => $this->type,
		);
	}

	/**
	 * Get id
	 *
	 * @return integer 
	 */
	public function getId()
	{
		return $this->id;
	}

	/**
	 * Set name
	 *
	 * @param string $name
	 * @return Customer
	 */
	public function setName($name)
	{
		$this->name = $name;
		return $this;
	}

	/**
	 * Get name
	 *
	 * @return string 
	 */
	public function getName()
	{
		return $this->name;
	}

	/**
	 * Set state
	 *
	 * @param string $state
	 * @return Customer
	 */
	public function setState($state)
	{
		$this->state = strtoupper($state);
		return $this;
	}

	/**
	 * Get state
	 *
	 * @return string 
	 */
	public function getState()
	{
		return $this->state;
	}

	/**
	 * Set type
	 *
	 * @param string $type
	 * @return Customer
	 */
	public function setType($type)
	{
		if( $type == "" ) {
			$this->type = null;
		} else {
			$this->type = strtoupper($type);
		}
		return $this;
	}

	/**
	 * Get type
	 *
	 * @return string 
	 */
	public function getType()
	{
		return $this->type;
	}
}
